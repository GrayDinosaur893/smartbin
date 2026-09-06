import os
import uuid
from datetime import datetime
from flask import Blueprint, request, render_template, redirect, url_for, session, jsonify, current_app
from werkzeug.utils import secure_filename
from app.database import db
from app.models.models import User, Report, Dustbin, Task, CleaningProof, RewardsLedger
from app.services.ai_service import AIService
from app.services.reward_service import RewardService

citizen_bp = Blueprint('citizen', __name__)

@citizen_bp.route('/')
def home():
    user_id = session.get('user_id')
    user = User.query.get(user_id) if user_id else None
    
    # Guest & logged in users can see live bin map & stats
    dustbins = Dustbin.query.filter_by(status='active').all()
    reports = Report.query.order_by(Report.created_at.desc()).limit(10).all()
    
    active_reports_count = Report.query.filter(Report.status.in_(['verified', 'assigned', 'in_progress'])).count()
    cleaned_today_count = Report.query.filter_by(status='completed').count()

    return render_template(
        'citizen/home.html',
        user=user,
        dustbins=dustbins,
        reports=reports,
        active_reports_count=active_reports_count,
        cleaned_today_count=cleaned_today_count,
        lang=session.get('lang', 'en')
    )


@citizen_bp.route('/citizen/dashboard')
def dashboard():
    user_id = session.get('user_id')
    if not user_id:
        return redirect(url_for('auth.login', role='citizen'))
    
    user = User.query.get(user_id)
    my_reports = Report.query.filter_by(citizen_id=user_id).order_by(Report.created_at.desc()).all()
    dustbins = Dustbin.query.filter_by(status='active').all()
    
    # Pending approval proofs sent by drivers
    pending_approvals = db.session.query(CleaningProof, Task, Report).\
        join(Task, CleaningProof.task_id == Task.id).\
        join(Report, Task.report_id == Report.id).\
        filter(Report.citizen_id == user_id, CleaningProof.citizen_approved == False).all()

    return render_template(
        'citizen/dashboard.html',
        user=user,
        reports=my_reports,
        dustbins=dustbins,
        pending_approvals=pending_approvals,
        lang=session.get('lang', 'en')
    )


@citizen_bp.route('/report-waste', methods=['GET', 'POST'])
def report_waste():
    # Mandatory login requirement enforced when user taps "Report Waste"
    user_id = session.get('user_id')
    if not user_id:
        return redirect(url_for('auth.login', role='citizen'))

    if request.method == 'POST':
        file = request.files.get('photo')
        lat_detected = float(request.form.get('lat_detected', 21.1904))
        lng_detected = float(request.form.get('lng_detected', 81.2849))
        lat_user = float(request.form.get('lat_user', lat_detected))
        lng_user = float(request.form.get('lng_user', lng_detected))
        user_notes = request.form.get('user_notes', '')

        if not file or file.filename == '':
            return render_template('citizen/report_form.html', error="Please select or capture a photo.")

        filename = f"{uuid.uuid4().hex[:8]}_{secure_filename(file.filename)}"
        upload_folder = os.path.join(current_app.static_folder, 'uploads')
        os.makedirs(upload_folder, exist_ok=True)
        file_path = os.path.join(upload_folder, filename)
        file.save(file_path)

        # Run AI Computer Vision Analysis Engine
        registered_dustbins = Dustbin.query.all()
        ai_res = AIService.analyze_waste_report(file_path, lat_user, lng_user, registered_dustbins)

        report_code = f"#SB{1000 + Report.query.count() + 1}"
        
        # Save Report
        new_report = Report(
            report_code=report_code,
            citizen_id=user_id,
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

        # Award rewards if verified
        if ai_res['verification_status'] == 'verified':
            RewardService.award_points_and_cash(
                user_id=user_id,
                points=50,
                cash=15.0,
                transaction_type="report_verified",
                description=f"Verified waste report {report_code}"
            )

        # Render interactive AI analysis result screen
        return render_template(
            'citizen/ai_result.html',
            report=new_report,
            ai_result=ai_res,
            lang=session.get('lang', 'en')
        )

    return render_template('citizen/report_form.html', lang=session.get('lang', 'en'))


@citizen_bp.route('/approve-cleaning/<int:proof_id>', methods=['POST'])
def approve_cleaning(proof_id):
    user_id = session.get('user_id')
    if not user_id:
        return redirect(url_for('auth.login'))

    proof = CleaningProof.query.get_or_404(proof_id)
    proof.citizen_approved = True
    
    task = Task.query.get(proof.task_id)
    task.status = 'cleaned'
    task.completed_at = datetime.utcnow()

    report = Report.query.get(task.report_id)
    report.status = 'completed'

    db.session.commit()

    # Award bonus for confirming cleanup
    RewardService.award_points_and_cash(
        user_id=user_id,
        points=20,
        cash=5.0,
        transaction_type="verification_bonus",
        description=f"Cleaned site verification bonus for {report.report_code}"
    )

    return redirect(url_for('citizen.dashboard'))
