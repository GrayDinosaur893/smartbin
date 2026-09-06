from datetime import datetime
from app.database import db

class MunicipalZone(db.Model):
    __tablename__ = 'municipal_zones'

    id = db.Column(db.Integer, primary_key=True)
    city_name = db.Column(db.String(100), unique=True, nullable=False) # e.g. 'Durg', 'Bhilai', 'Raipur', 'Bilaspur', 'Korba', 'Rajnandgaon'
    corporation_name = db.Column(db.String(200), nullable=False)
    state = db.Column(db.String(50), default='Chhattisgarh')
    depot_lat = db.Column(db.Float, nullable=False)
    depot_lng = db.Column(db.Float, nullable=False)
    radius_km = db.Column(db.Float, default=25.0)


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20), nullable=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='citizen') # 'citizen', 'driver', 'admin'
    city_zone = db.Column(db.String(100), default='Durg') # City Municipal Corporation assignment
    eco_points = db.Column(db.Integer, default=0)
    cash_wallet_balance = db.Column(db.Float, default=0.0)
    language_preference = db.Column(db.String(10), default='en')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    reports = db.relationship('Report', backref='citizen', lazy=True)
    driver_profile = db.relationship('DriverProfile', backref='user', uselist=False, lazy=True)


class DriverProfile(db.Model):
    __tablename__ = 'driver_profiles'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    vehicle_number = db.Column(db.String(30), nullable=False)
    vehicle_type = db.Column(db.String(50), default='Garbage Truck 4T')
    assigned_zone = db.Column(db.String(100), default='Durg Municipal Corporation')
    city_name = db.Column(db.String(100), default='Durg')
    shift_status = db.Column(db.String(20), default='off_duty')
    last_clock_in = db.Column(db.DateTime, nullable=True)


class Dustbin(db.Model):
    __tablename__ = 'dustbins'

    id = db.Column(db.Integer, primary_key=True)
    bin_code = db.Column(db.String(30), unique=True, nullable=False)
    city_name = db.Column(db.String(100), default='Durg')
    location_name = db.Column(db.String(200), nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    capacity_liters = db.Column(db.Integer, default=500)
    status = db.Column(db.String(20), default='active')


class Report(db.Model):
    __tablename__ = 'reports'

    id = db.Column(db.Integer, primary_key=True)
    report_code = db.Column(db.String(30), unique=True, nullable=False)
    citizen_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    city_name = db.Column(db.String(100), default='Durg')
    image_path = db.Column(db.String(255), nullable=False)
    gps_lat_detected = db.Column(db.Float, nullable=False)
    gps_lng_detected = db.Column(db.Float, nullable=False)
    gps_lat_user = db.Column(db.Float, nullable=False)
    gps_lng_user = db.Column(db.Float, nullable=False)
    user_notes = db.Column(db.Text, nullable=True)
    
    status = db.Column(db.String(30), default='pending_ai')
    waste_type = db.Column(db.String(50), default='General Waste')
    severity = db.Column(db.String(20), default='medium')
    is_illegal_dumping = db.Column(db.Boolean, default=False)
    ai_confidence = db.Column(db.Float, default=0.0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    task = db.relationship('Task', backref='report', uselist=False, lazy=True)


class Task(db.Model):
    __tablename__ = 'tasks'

    id = db.Column(db.Integer, primary_key=True)
    task_code = db.Column(db.String(30), unique=True, nullable=False)
    report_id = db.Column(db.Integer, db.ForeignKey('reports.id'), nullable=False)
    driver_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    city_name = db.Column(db.String(100), default='Durg')
    route_sequence_index = db.Column(db.Integer, default=0)
    status = db.Column(db.String(30), default='assigned')
    assigned_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime, nullable=True)

    cleaning_proof = db.relationship('CleaningProof', backref='task', uselist=False, lazy=True)


class CleaningProof(db.Model):
    __tablename__ = 'cleaning_proofs'

    id = db.Column(db.Integer, primary_key=True)
    task_id = db.Column(db.Integer, db.ForeignKey('tasks.id'), nullable=False)
    driver_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    after_image_path = db.Column(db.String(255), nullable=False)
    driver_lat = db.Column(db.Float, nullable=False)
    driver_lng = db.Column(db.Float, nullable=False)
    gps_verified = db.Column(db.Boolean, default=True)
    citizen_approved = db.Column(db.Boolean, default=False)
    auto_approved_by_timeout = db.Column(db.Boolean, default=False)
    submitted_at = db.Column(db.DateTime, default=datetime.utcnow)


class Attendance(db.Model):
    __tablename__ = 'attendance'

    id = db.Column(db.Integer, primary_key=True)
    driver_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    selfie_image_path = db.Column(db.String(255), nullable=False)
    clock_in_lat = db.Column(db.Float, nullable=False)
    clock_in_lng = db.Column(db.Float, nullable=False)
    clock_in_time = db.Column(db.DateTime, default=datetime.utcnow)
    clock_out_time = db.Column(db.DateTime, nullable=True)


class RewardsLedger(db.Model):
    __tablename__ = 'rewards_ledger'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    points_earned = db.Column(db.Integer, default=0)
    cash_earned = db.Column(db.Float, default=0.0)
    transaction_type = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(255), nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)


class SponsorOffer(db.Model):
    __tablename__ = 'sponsor_offers'

    id = db.Column(db.Integer, primary_key=True)
    company_name = db.Column(db.String(150), nullable=False)
    contact_email = db.Column(db.String(120), nullable=False)
    offer_title = db.Column(db.String(200), nullable=False)
    offer_type = db.Column(db.String(50), default='Voucher') # 'Voucher', 'Subsidy', 'Discount', 'CSR Fund'
    description = db.Column(db.Text, nullable=False)
    city_scope = db.Column(db.String(100), default='All Chhattisgarh')
    points_required = db.Column(db.Integer, default=50)
    voucher_code_prefix = db.Column(db.String(50), default='SPONSOR-')
    status = db.Column(db.String(20), default='approved') # 'pending', 'approved'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class UserActivityLog(db.Model):
    __tablename__ = 'user_activity_logs'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    user_name = db.Column(db.String(100), nullable=True)
    phone_or_email = db.Column(db.String(120), nullable=True)
    action_type = db.Column(db.String(100), nullable=False) # 'LOGIN_OTP', 'LOGIN_PASSWORD', 'REGISTER', 'REPORT_WASTE', 'CLEANING_APPROVED'
    description = db.Column(db.Text, nullable=True)
    ip_address = db.Column(db.String(50), nullable=True)
    user_agent = db.Column(db.String(255), nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)


