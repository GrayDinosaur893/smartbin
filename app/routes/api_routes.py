import os
import uuid
import csv
import io
from datetime import datetime
from flask import Blueprint, request, jsonify, current_app, make_response
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from app.database import db
from app.models.models import User, DriverProfile, Dustbin, Report, Task, CleaningProof, Attendance, RewardsLedger, MunicipalZone, SponsorOffer, UserActivityLog, VoucherRedemption
from app.services.ai_service import AIService
from app.services.vrp_service import VRPService
from app.services.reward_service import RewardService
from app.services.sms_service import SMSService

api_bp = Blueprint('api', __name__)
vrp_service = VRPService()

def log_user_activity(user_id, user_name, phone_or_email, action_type, description):
    try:
        ip = request.remote_addr or '127.0.0.1'
        ua = request.headers.get('User-Agent', '')[:250]
        log_entry = UserActivityLog(
            user_id=user_id,
            user_name=user_name,
            phone_or_email=phone_or_email,
            action_type=action_type,
            description=description,
            ip_address=ip,
            user_agent=ua
        )
        db.session.add(log_entry)
        db.session.commit()
    except Exception as e:
        print(f"[ActivityLog Notice] {e}")

# --------------------------------------------------
# 1. CHHATTISGARH MUNICIPAL ZONES REST API
# --------------------------------------------------

@api_bp.route('/public/municipal-zones', methods=['GET'])
def get_municipal_zones():
    try:
        zones = MunicipalZone.query.all()
        return jsonify({
            'state': 'Chhattisgarh',
            'zones': [{
                'id': z.id,
                'city_name': z.city_name,
                'corporation_name': z.corporation_name,
                'depot_lat': z.depot_lat,
                'depot_lng': z.depot_lng,
                'radius_km': z.radius_km
            } for z in zones]
        })
    except Exception as e:
        print(f"[Municipal Zones API Exception] {e}")
        return jsonify({
            'state': 'Chhattisgarh',
            'zones': [
                {'id': 1, 'city_name': 'Bilaspur', 'corporation_name': 'Bilaspur Municipal Corporation', 'depot_lat': 22.0797, 'depot_lng': 82.1391, 'radius_km': 15.0},
                {'id': 2, 'city_name': 'Raipur', 'corporation_name': 'Raipur Municipal Corporation', 'depot_lat': 21.2514, 'depot_lng': 81.6296, 'radius_km': 18.0},
                {'id': 3, 'city_name': 'Durg', 'corporation_name': 'Durg Municipal Corporation', 'depot_lat': 21.1904, 'depot_lng': 81.2849, 'radius_km': 12.0}
            ]
        })

# --------------------------------------------------
# 2. AUTHENTICATION REST APIS
# --------------------------------------------------

@api_bp.route('/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json() or {}
        email = data.get('email')
        password = data.get('password')

        user = User.query.filter_by(email=email).first()
        if user and check_password_hash(user.password_hash, password):
            return jsonify({
                'success': True,
                'user': {
                    'id': user.id,
                    'name': user.name,
                    'email': user.email,
                    'role': user.role,
                    'city_zone': user.city_zone or 'Durg',
                    'eco_points': user.eco_points,
                    'cash_wallet_balance': user.cash_wallet_balance,
                    'lang': user.language_preference or 'en'
                }
            })
        return jsonify({'success': False, 'error': 'Invalid email or password'}), 200
    except Exception as e:
        print(f"[Login Exception] {e}")
        return jsonify({'success': False, 'error': f'Database Connection Error: {str(e)}'}), 500


# In-Memory OTP Store for Mobile OTP Authentication
OTP_STORE = {}

@api_bp.route('/auth/send-otp', methods=['POST'])
def send_otp():
    try:
        data = request.get_json() or {}
        phone = data.get('phone', '').strip()

        if not phone:
            return jsonify({'success': False, 'error': 'Phone number is required'}), 400

        clean_phone = phone.replace('+91', '').replace('-', '').strip()
        if len(clean_phone) < 10:
            return jsonify({'success': False, 'error': 'Please enter a valid 10-digit Indian mobile number'}), 400

        import random
        otp = str(random.randint(100000, 999999))
        OTP_STORE[clean_phone] = {
            'otp': otp,
            'created_at': datetime.utcnow().timestamp()
        }

        # Dispatch SMS & Free Mobile Links via SMSService
        sms_msg = f"[SMARTBIN CG] Your Mobile Login OTP is {otp}. Valid for 5 minutes. Clean Chhattisgarh Helpline: 1800-233-1042"
        sms_res = SMSService.send_sms(recipient_phone=clean_phone, message_body=sms_msg)

        return jsonify({
            'success': True,
            'message': f'OTP sent successfully to mobile +91 {clean_phone}!',
            'phone': clean_phone,
            'demo_otp': otp,
            'sms_details': sms_res
        })
    except Exception as e:
        print(f"[send_otp Exception] {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@api_bp.route('/auth/verify-otp', methods=['POST'])
def verify_otp():
    try:
        data = request.get_json() or {}
        phone = data.get('phone', '').strip()
        otp_entered = data.get('otp', '').strip()
        name = data.get('name', 'Mobile Citizen')
        city_zone = data.get('city_zone', 'Bilaspur')

        clean_phone = phone.replace('+91', '').replace('-', '').strip()
        record = OTP_STORE.get(clean_phone)

        if not record or record['otp'] != otp_entered:
            return jsonify({'success': False, 'error': 'Invalid OTP entered. Please try again.'}), 400

        # Search for existing user with this phone or email
        user = User.query.filter((User.phone == clean_phone) | (User.email == f"{clean_phone}@smartbin.cg.gov.in")).first()

        if not user:
            # Auto-Register New Mobile User
            hashed_pw = generate_password_hash("otp_login_2026")
            user = User(
                name=name if name != 'Mobile Citizen' else f"Citizen ({clean_phone[-4:]})",
                email=f"{clean_phone}@smartbin.cg.gov.in",
                phone=clean_phone,
                password_hash=hashed_pw,
                role='citizen',
                city_zone=city_zone,
                eco_points=100,
                cash_wallet_balance=1.00
            )
            db.session.add(user)
            db.session.commit()

        # Clear used OTP
        OTP_STORE.pop(clean_phone, None)

        # Record User Audit Activity Log in Database
        log_user_activity(
            user_id=user.id,
            user_name=user.name,
            phone_or_email=user.phone or user.email,
            action_type='LOGIN_OTP',
            description=f"Successful Mobile OTP login/registration for {user.phone} in {user.city_zone}"
        )

        return jsonify({
            'success': True,
            'message': f'Welcome back, {user.name}!',
            'user': {
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'phone': user.phone,
                'role': user.role,
                'city_zone': user.city_zone or 'Bilaspur',
                'eco_points': user.eco_points,
                'cash_wallet_balance': user.cash_wallet_balance,
                'lang': user.language_preference or 'en'
            }
        })
    except Exception as e:
        print(f"[verify_otp Exception] {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@api_bp.route('/auth/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    name = data.get('name')
    email = data.get('email')
    phone = data.get('phone')
    password = data.get('password')
    role = data.get('role', 'citizen')
    city_zone = data.get('city_zone', 'Durg')

    if User.query.filter_by(email=email).first():
        return jsonify({'success': False, 'error': 'Email already registered'}), 400

    hashed_pw = generate_password_hash(password)
    new_user = User(
        name=name,
        email=email,
        phone=phone,
        password_hash=hashed_pw,
        role=role,
        city_zone=city_zone,
        eco_points=100,
        cash_wallet_balance=150.0
    )
    db.session.add(new_user)
    db.session.commit()

    if role == 'driver':
        driver_prof = DriverProfile(
            user_id=new_user.id,
            vehicle_number="CG-07-G-1042",
            vehicle_type="Garbage Truck 4T",
            assigned_zone=f"{city_zone} Municipal Corporation",
            city_name=city_zone
        )
        db.session.add(driver_prof)
        db.session.commit()

    return jsonify({
        'success': True,
        'user': {
            'id': new_user.id,
            'name': new_user.name,
            'email': new_user.email,
            'role': new_user.role,
            'city_zone': new_user.city_zone,
            'eco_points': new_user.eco_points,
            'cash_wallet_balance': new_user.cash_wallet_balance,
            'lang': 'en'
        }
    })

# --------------------------------------------------
# 3. PUBLIC MAP & SNAPSHOT REST APIS
# --------------------------------------------------

@api_bp.route('/public/waste-map', methods=['GET'])
def get_public_waste_map():
    try:
        city = request.args.get('city')
        
        if city:
            dustbins = Dustbin.query.filter_by(city_name=city).all()
            reports = Report.query.filter_by(city_name=city).order_by(Report.created_at.desc()).limit(20).all()
        else:
            dustbins = Dustbin.query.all()
            reports = Report.query.order_by(Report.created_at.desc()).limit(20).all()

        active_count = Report.query.filter(Report.status.in_(['verified', 'assigned', 'in_progress'])).count()
        cleaned_count = Report.query.filter_by(status='completed').count()

        return jsonify({
            'dustbins': [{
                'id': b.id,
                'code': b.bin_code,
                'city': b.city_name,
                'location_name': b.location_name,
                'lat': b.latitude,
                'lng': b.longitude,
                'capacity': b.capacity_liters
            } for b in dustbins],
            'reports': [{
                'id': r.id,
                'code': r.report_code,
                'city': r.city_name,
                'waste_type': r.waste_type,
                'severity': r.severity,
                'is_illegal_dumping': r.is_illegal_dumping,
                'status': r.status,
                'lat': r.gps_lat_user,
                'lng': r.gps_lng_user,
                'created_at': r.created_at.strftime("%b %d, %H:%M")
            } for r in reports],
            'stats': {
                'active_reports': active_count,
                'cleaned_today': cleaned_count
            }
        })
    except Exception as e:
        print(f"[Waste Map API Exception] {e}")
        return jsonify({
            'dustbins': [],
            'reports': [],
            'stats': {'active_reports': 0, 'cleaned_today': 0},
            'notice': 'Database initialization in progress'
        }), 200

# --------------------------------------------------
# 4. CITIZEN EXPERIENCE REST APIS
# --------------------------------------------------

@api_bp.route('/citizen/dashboard/<int:user_id>', methods=['GET'])
def get_citizen_dashboard(user_id):
    user = User.query.get_or_404(user_id)
    my_reports = Report.query.filter_by(citizen_id=user_id).order_by(Report.created_at.desc()).all()

    pending_approvals = db.session.query(CleaningProof, Task, Report).\
        join(Task, CleaningProof.task_id == Task.id).\
        join(Report, Task.report_id == Report.id).\
        filter(Report.citizen_id == user_id, CleaningProof.citizen_approved == False).all()

    redemptions = VoucherRedemption.query.filter_by(user_id=user_id).order_by(VoucherRedemption.redeemed_at.desc()).all()
    claimed_vouchers = [{
        'id': v.id,
        'voucher_code': v.voucher_code,
        'points_spent': v.points_spent,
        'redeemed_at': v.redeemed_at.strftime("%b %d, %Y %H:%M"),
        'company_name': v.sponsor_offer.company_name if v.sponsor_offer else 'Government of CG',
        'offer_title': v.sponsor_offer.offer_title if v.sponsor_offer else 'Swachh Rewards Voucher',
        'offer_type': v.sponsor_offer.offer_type if v.sponsor_offer else 'Voucher'
    } for v in redemptions]

    return jsonify({
        'user': {
            'id': user.id,
            'name': user.name,
            'city_zone': user.city_zone,
            'eco_points': user.eco_points,
            'cash_wallet_balance': user.cash_wallet_balance,
            'total_claimed_vouchers': len(claimed_vouchers)
        },
        'reports': [{
            'id': r.id,
            'code': r.report_code,
            'city': r.city_name,
            'waste_type': r.waste_type,
            'severity': r.severity,
            'ai_confidence': r.ai_confidence,
            'status': r.status,
            'created_at': r.created_at.strftime("%b %d, %H:%M")
        } for r in my_reports],
        'pending_approvals': [{
            'proof_id': p.id,
            'report_code': r.report_code,
            'waste_type': r.waste_type,
            'before_image': r.image_path,
            'after_image': p.after_image_path
        } for p, t, r in pending_approvals],
        'claimed_vouchers': claimed_vouchers
    })


@api_bp.route('/citizen/vouchers/<int:user_id>', methods=['GET'])
def get_user_vouchers_api(user_id):
    try:
        user = User.query.get_or_404(user_id)
        redemptions = VoucherRedemption.query.filter_by(user_id=user_id).order_by(VoucherRedemption.redeemed_at.desc()).all()
        return jsonify({
            'success': True,
            'user_id': user.id,
            'eco_points': user.eco_points,
            'cash_wallet_balance': user.cash_wallet_balance,
            'claimed_vouchers': [{
                'id': v.id,
                'voucher_code': v.voucher_code,
                'points_spent': v.points_spent,
                'redeemed_at': v.redeemed_at.strftime("%b %d, %Y %H:%M"),
                'company_name': v.sponsor_offer.company_name if v.sponsor_offer else 'Government of CG',
                'offer_title': v.sponsor_offer.offer_title if v.sponsor_offer else 'Swachh Rewards Voucher',
                'offer_type': v.sponsor_offer.offer_type if v.sponsor_offer else 'Voucher'
            } for v in redemptions]
        })
    except Exception as e:
        print(f"[User Vouchers API Exception] {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@api_bp.route('/citizen/report-waste', methods=['POST'])
def report_waste_api():
    user_id = request.form.get('user_id')
    lat_detected = float(request.form.get('lat_detected', 21.1904))
    lng_detected = float(request.form.get('lng_detected', 81.2849))
    lat_user = float(request.form.get('lat_user', lat_detected))
    lng_user = float(request.form.get('lng_user', lng_detected))
    user_notes = request.form.get('user_notes', '')

    # Validate Chhattisgarh State Boundaries (Lat: 17.70 to 24.15, Lng: 80.20 to 84.40)
    if not (17.70 <= lat_user <= 24.15 and 80.20 <= lng_user <= 84.40):
        return jsonify({
            'success': False,
            'error': 'Sorry, SmartBin currently operates only in Chhattisgarh state! (क्षमा करें! स्मार्टबिन सेवा केवल छत्तीसगढ़ राज्य में उपलब्ध है।)'
        }), 400

    filename = f"{uuid.uuid4().hex[:8]}_{secure_filename(file.filename)}"
    upload_folder = os.path.join(current_app.static_folder, 'uploads')
    os.makedirs(upload_folder, exist_ok=True)
    file_path = os.path.join(upload_folder, filename)
    file.save(file_path)

    # Determine City Municipal Zone based on GPS coordinates
    closest_zone = "Durg"
    min_dist = float('inf')
    for zone in MunicipalZone.query.all():
        dist = AIService.calculate_haversine_distance(lat_user, lng_user, zone.depot_lat, zone.depot_lng)
        if dist < min_dist:
            min_dist = dist
            closest_zone = zone.city_name

    registered_dustbins = Dustbin.query.all()
    ai_res = AIService.analyze_waste_report(file_path, lat_user, lng_user, registered_dustbins)

    report_code = f"#SB{1000 + Report.query.count() + 1}"

    new_report = Report(
        report_code=report_code,
        citizen_id=int(user_id) if user_id else None,
        city_name=closest_zone,
        image_path=f"uploads/{filename}",
        gps_lat_detected=lat_detected,
        gps_lng_detected=lng_detected,
        gps_lat_user=lat_user,
        gps_lng_user=lng_user,
        user_notes=user_notes,
        status=ai_res['verification_status'],
        waste_type=ai_res['waste_type'],
        severity=ai_res['severity'],
        is_illegal_dumping=ai_res['is_illegal_dumping'],
        ai_confidence=ai_res['confidence_score']
    )
    db.session.add(new_report)
    db.session.commit()

    if user_id and ai_res['verification_status'] == 'verified':
        RewardService.award_points_and_cash(
            user_id=int(user_id),
            points=100,
            transaction_type="report_verified",
            description=f"Verified waste report {report_code}"
        )

    # Fetch citizen phone if available
    citizen_user = User.query.get(int(user_id)) if user_id else None
    citizen_phone = citizen_user.phone if citizen_user else None

    # Trigger Automated SMS Dispatch to target phone 8085668669 & citizen phone
    sms_results = SMSService.send_report_confirmation_sms(
        report_code=new_report.report_code,
        city_name=new_report.city_name,
        waste_type=new_report.waste_type,
        eco_points=100,
        user_phone=citizen_phone
    )

    return jsonify({
        'success': True,
        'report': {
            'id': new_report.id,
            'code': new_report.report_code,
            'city': new_report.city_name,
            'status': new_report.status,
            'waste_type': new_report.waste_type,
            'severity': new_report.severity,
            'is_illegal_dumping': new_report.is_illegal_dumping,
            'ai_confidence': new_report.ai_confidence
        },
        'sms_notification': {
            'sent': True,
            'target_phone': SMSService.ADMIN_SMS_TARGET,
            'citizen_phone': citizen_phone,
            'log': sms_results
        },
        'ai_analysis': ai_res
    })


@api_bp.route('/citizen/approve-cleaning/<int:proof_id>', methods=['POST'])
def approve_cleaning_api(proof_id):
    data = request.get_json() or {}
    user_id = data.get('user_id')

    proof = CleaningProof.query.get_or_404(proof_id)
    proof.citizen_approved = True

    task = Task.query.get(proof.task_id)
    task.status = 'cleaned'
    task.completed_at = datetime.utcnow()

    report = Report.query.get(task.report_id)
    report.status = 'completed'

    db.session.commit()

    if user_id:
        RewardService.award_points_and_cash(
            user_id=int(user_id),
            points=50,
            transaction_type="verification_bonus",
            description=f"Cleaned site approval bonus for {report.report_code}"
        )

    return jsonify({'success': True, 'message': 'Cleaning proof approved!'})

# --------------------------------------------------
# 5. DRIVER REST APIS
# --------------------------------------------------

@api_bp.route('/driver/dashboard/<int:user_id>', methods=['GET'])
def get_driver_dashboard(user_id):
    user = User.query.get_or_404(user_id)
    profile = DriverProfile.query.filter_by(user_id=user_id).first()

    assigned_tasks = db.session.query(Task, Report).\
        join(Report, Task.report_id == Report.id).\
        filter(Task.driver_id == user_id, Task.status.in_(['assigned', 'en_route', 'arrived'])).\
        order_by(Task.route_sequence_index.asc()).all()

    completed_today = Task.query.filter_by(driver_id=user_id, status='cleaned').count()

    return jsonify({
        'driver': {
            'name': user.name,
            'city_name': profile.city_name if profile else "Durg",
            'vehicle_number': profile.vehicle_number if profile else "CG-07-G-1042",
            'assigned_zone': profile.assigned_zone if profile else "Durg Municipal Corporation",
            'clocked_in': profile.shift_status == 'on_duty' if profile else False
        },
        'completed_today': completed_today,
        'tasks': [{
            'task_id': t.id,
            'route_sequence': t.route_sequence_index,
            'report_code': r.report_code,
            'city': r.city_name,
            'waste_type': r.waste_type,
            'severity': r.severity,
            'is_illegal_dumping': r.is_illegal_dumping,
            'lat': r.gps_lat_user,
            'lng': r.gps_lng_user,
            'image_path': r.image_path
        } for t, r in assigned_tasks]
    })


@api_bp.route('/driver/clock-in', methods=['POST'])
def driver_clock_in_api():
    user_id = request.form.get('user_id')
    lat = float(request.form.get('lat', 21.1904))
    lng = float(request.form.get('lng', 81.2849))
    file = request.files.get('selfie')

    if not file:
        return jsonify({'success': False, 'error': 'Selfie required'}), 400

    filename = f"selfie_{uuid.uuid4().hex[:8]}_{secure_filename(file.filename)}"
    upload_folder = os.path.join(current_app.static_folder, 'uploads')
    os.makedirs(upload_folder, exist_ok=True)
    file.save(os.path.join(upload_folder, filename))

    attendance = Attendance(
        driver_id=int(user_id),
        selfie_image_path=f"uploads/{filename}",
        clock_in_lat=lat,
        clock_in_lng=lng
    )
    db.session.add(attendance)

    profile = DriverProfile.query.filter_by(user_id=int(user_id)).first()
    if profile:
        profile.shift_status = 'on_duty'
        profile.last_clock_in = datetime.utcnow()

    db.session.commit()
    return jsonify({'success': True, 'message': 'Clocked in successfully!'})


@api_bp.route('/driver/submit-cleaning/<int:task_id>', methods=['POST'])
def driver_submit_cleaning_api(task_id):
    user_id = request.form.get('user_id')
    driver_lat = float(request.form.get('driver_lat', 21.1904))
    driver_lng = float(request.form.get('driver_lng', 81.2849))
    file = request.files.get('after_photo')

    if not file:
        return jsonify({'success': False, 'error': 'After photo required'}), 400

    task = Task.query.get_or_404(task_id)
    report = Report.query.get(task.report_id)

    filename = f"after_{uuid.uuid4().hex[:8]}_{secure_filename(file.filename)}"
    upload_folder = os.path.join(current_app.static_folder, 'uploads')
    os.makedirs(upload_folder, exist_ok=True)
    file.save(os.path.join(upload_folder, filename))

    dist_m = AIService.calculate_haversine_distance(driver_lat, driver_lng, report.gps_lat_user, report.gps_lng_user)
    gps_verified = dist_m <= 150.0

    proof = CleaningProof(
        task_id=task.id,
        driver_id=int(user_id),
        after_image_path=f"uploads/{filename}",
        driver_lat=driver_lat,
        driver_lng=driver_lng,
        gps_verified=gps_verified,
        citizen_approved=False
    )
    db.session.add(proof)

    task.status = 'cleaned_pending_approval'
    report.status = 'cleaned_pending_approval'
    db.session.commit()

    return jsonify({'success': True, 'message': 'Proof submitted for citizen verification!'})

# --------------------------------------------------
# 6. MUNICIPAL ADMIN CONTROL CENTER REST APIS (STRICTLY CITY SCOPED C++ VRP)
# --------------------------------------------------

@api_bp.route('/admin/dashboard', methods=['GET'])
def get_admin_dashboard():
    city = request.args.get('city')
    
    if city:
        reports_today = Report.query.filter_by(city_name=city).count()
        pending_review = Report.query.filter_by(city_name=city).filter(Report.status.in_(['pending_ai', 'uncertain'])).count()
        assigned_tasks = Task.query.filter_by(city_name=city, status='assigned').count()
        cleaned_today = Report.query.filter_by(city_name=city, status='completed').count()

        unverified_reports = Report.query.filter_by(city_name=city, status='uncertain').all()
        high_priority_overflow = Report.query.filter_by(city_name=city, severity='high', status='verified').all()
        illegal_dumping_reports = Report.query.filter_by(city_name=city, is_illegal_dumping=True).all()

        reports = Report.query.filter_by(city_name=city).order_by(Report.created_at.desc()).limit(15).all()
        dustbins = Dustbin.query.filter_by(city_name=city).all()
        drivers = User.query.filter_by(role='driver', city_zone=city).all()
    else:
        reports_today = Report.query.count()
        pending_review = Report.query.filter(Report.status.in_(['pending_ai', 'uncertain'])).count()
        assigned_tasks = Task.query.filter_by(status='assigned').count()
        cleaned_today = Report.query.filter_by(status='completed').count()

        unverified_reports = Report.query.filter_by(status='uncertain').all()
        high_priority_overflow = Report.query.filter_by(severity='high', status='verified').all()
        illegal_dumping_reports = Report.query.filter_by(is_illegal_dumping=True).all()

        reports = Report.query.order_by(Report.created_at.desc()).limit(15).all()
        dustbins = Dustbin.query.all()
        drivers = User.query.filter_by(role='driver').all()

    inactive_drivers = DriverProfile.query.filter_by(shift_status='off_duty').all()
    zones = MunicipalZone.query.all()

    return jsonify({
        'current_date': datetime.now().strftime("%A, %d %B %Y"),
        'kpis': {
            'reports_today': reports_today,
            'pending_review': pending_review,
            'assigned_tasks': assigned_tasks,
            'cleaned_today': cleaned_today
        },
        'attention_required': {
            'unverified_count': len(unverified_reports),
            'high_priority_count': len(high_priority_overflow),
            'inactive_drivers_count': len(inactive_drivers),
            'illegal_dumping_count': len(illegal_dumping_reports)
        },
        'zones': [{'city': z.city_name, 'corporation': z.corporation_name} for z in zones],
        'dustbins': [{'id': b.id, 'code': b.bin_code, 'city': b.city_name, 'name': b.location_name, 'lat': b.latitude, 'lng': b.longitude} for b in dustbins],
        'drivers': [{'id': d.id, 'name': d.name, 'city': d.city_zone} for d in drivers],
        'reports': [{
            'id': r.id,
            'code': r.report_code,
            'city': r.city_name,
            'waste_type': r.waste_type,
            'severity': r.severity,
            'is_illegal_dumping': r.is_illegal_dumping,
            'ai_confidence': r.ai_confidence,
            'status': r.status,
            'lat': r.gps_lat_user,
            'lng': r.gps_lng_user
        } for r in reports]
    })


@api_bp.route('/admin/optimize-routes', methods=['POST'])
def admin_optimize_routes_api():
    """
    Triggers C++ VRP Engine for strict City Municipal Zone TSP Route Optimization.
    Ensures Durg driver collects strictly in Durg, Bilaspur driver collects strictly in Bilaspur!
    """
    data = request.get_json() or {}
    driver_user_id = int(data.get('driver_id', 0))

    if not driver_user_id:
        return jsonify({'success': False, 'error': 'Driver selection required'}), 400

    driver = User.query.get_or_404(driver_user_id)
    driver_city = driver.city_zone or 'Durg'

    # Get Driver's City Municipal Corporation Depot Coordinates
    city_zone = MunicipalZone.query.filter_by(city_name=driver_city).first()
    depot_lat = city_zone.depot_lat if city_zone else 21.1904
    depot_lng = city_zone.depot_lng if city_zone else 81.2849

    driver_start = {'id': 0, 'lat': depot_lat, 'lng': depot_lng, 'urgency': 1}

    # Fetch verified reports strictly matching the Driver's City Municipal Zone
    city_unassigned_reports = Report.query.filter_by(city_name=driver_city).filter(Report.status.in_(['verified', 'uncertain'])).all()
    
    if not city_unassigned_reports:
        return jsonify({
            'success': False,
            'message': f'No verified reports pending in {driver_city} Municipal Corporation Zone.'
        })

    stops = []
    for r in city_unassigned_reports:
        urgency_val = 3 if r.is_illegal_dumping or r.severity == 'high' else (2 if r.severity == 'medium' else 1)
        stops.append({'id': r.id, 'lat': r.gps_lat_user, 'lng': r.gps_lng_user, 'urgency': urgency_val})

    # Call C++ VRP Solver Engine with City Zone Nearest Neighbor Filtering
    opt_result = vrp_service.optimize_route(driver_start, stops)
    ordered_ids = opt_result['ordered_ids']

    for seq_index, report_id in enumerate(ordered_ids):
        existing_task = Task.query.filter_by(report_id=report_id).first()
        if not existing_task:
            task_code = f"#TSK-{1000 + Task.query.count() + 1}"
            new_task = Task(
                task_code=task_code,
                report_id=report_id,
                driver_id=driver_user_id,
                city_name=driver_city,
                route_sequence_index=seq_index + 1,
                status='assigned'
            )
            db.session.add(new_task)
        else:
            existing_task.driver_id = driver_user_id
            existing_task.city_name = driver_city
            existing_task.route_sequence_index = seq_index + 1
            existing_task.status = 'assigned'

        rep = Report.query.get(report_id)
        if rep:
            rep.status = 'assigned'

    db.session.commit()

    return jsonify({
        'success': True,
        'message': f'C++ Engine optimized route with {len(ordered_ids)} stops strictly inside {driver_city} Municipal Corporation Zone!',
        'driver_city': driver_city,
        'vrp_summary': opt_result
    })

# --------------------------------------------------
# 10. CORPORATE SPONSORS & CSR SUBSIDIES REST APIS
# --------------------------------------------------

@api_bp.route('/public/sponsors', methods=['GET'])
def get_sponsors():
    sponsors = SponsorOffer.query.filter_by(status='approved').order_by(SponsorOffer.created_at.desc()).all()
    return jsonify({
        'success': True,
        'sponsors': [{
            'id': s.id,
            'company_name': s.company_name,
            'contact_email': s.contact_email,
            'offer_title': s.offer_title,
            'offer_type': s.offer_type,
            'description': s.description,
            'city_scope': s.city_scope,
            'points_required': s.points_required,
            'voucher_code_prefix': s.voucher_code_prefix,
            'created_at': s.created_at.strftime('%Y-%m-%d %H:%M')
        } for s in sponsors]
    })


@api_bp.route('/sponsors/apply', methods=['POST'])
def apply_sponsor_offer():
    data = request.get_json() or {}
    company_name = data.get('company_name')
    contact_email = data.get('contact_email')
    offer_title = data.get('offer_title')
    offer_type = data.get('offer_type', 'Voucher')
    description = data.get('description')
    city_scope = data.get('city_scope', 'All Chhattisgarh')
    points_required = int(data.get('points_required', 50))
    voucher_code_prefix = data.get('voucher_code_prefix', 'SPONSOR-')

    if not company_name or not contact_email or not offer_title or not description:
        return jsonify({'success': False, 'error': 'All fields are required'}), 400

    new_offer = SponsorOffer(
        company_name=company_name,
        contact_email=contact_email,
        offer_title=offer_title,
        offer_type=offer_type,
        description=description,
        city_scope=city_scope,
        points_required=points_required,
        voucher_code_prefix=voucher_code_prefix,
        status='approved' # Instantly approved for immediate display
    )
    db.session.add(new_offer)
    db.session.commit()

    return jsonify({
        'success': True,
        'message': f'Thank you {company_name}! Your CSR voucher offer has been published for citizens across {city_scope}.',
        'offer': {
            'id': new_offer.id,
            'company_name': new_offer.company_name,
            'offer_title': new_offer.offer_title
        }
    })


@api_bp.route('/sponsors/redeem', methods=['POST'])
def redeem_sponsor_api():
    data = request.get_json() or {}
    user_id = data.get('user_id')
    sponsor_id = data.get('sponsor_id')

    if not user_id or not sponsor_id:
        return jsonify({'success': False, 'error': 'User ID and Sponsor Offer ID are required'}), 400

    result = RewardService.redeem_sponsor_voucher(user_id=int(user_id), sponsor_offer_id=int(sponsor_id))

    if result.get('success'):
        # Log audit activity
        user = User.query.get(int(user_id))
        if user:
            log_user_activity(
                user_id=user.id,
                user_name=user.name,
                phone_or_email=user.phone or user.email,
                action_type='VOUCHER_REDEEMED',
                description=f"Redeemed voucher {result['voucher_code']} (-{result['points_spent']} Pts)"
            )
        return jsonify(result), 200
    else:
        return jsonify(result), 400


@api_bp.route('/public/test-sms', methods=['GET', 'POST'])
def test_sms_api():
    phone = request.args.get('phone') or (request.json.get('phone') if request.is_json else '8085668669')
    results = SMSService.send_report_confirmation_sms(
        report_code="#SB1099",
        city_name="Bilaspur",
        waste_type="Overflowing Garbage Dump",
        eco_points=100,
        user_phone=phone
    )
    return jsonify({
        'success': True,
        'message': f'1-Click Free Cellular SMS dispatched for +91 {phone}!',
        'sms_logs': results
    })



