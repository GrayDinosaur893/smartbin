import os
import uuid
from datetime import datetime
from flask import Blueprint, request, render_template, redirect, url_for, session, current_app, jsonify
from werkzeug.utils import secure_filename
from app.database import db
from app.models.models import User, DriverProfile, Task, Report, CleaningProof, Attendance
from app.services.ai_service import AIService

driver_bp = Blueprint('driver', __name__)

@driver_bp.route('/driver/dashboard')
def dashboard():
    user_id = session.get('user_id')
    if not user_id or session.get('user_role') != 'driver':
        return redirect(url_for('auth.login', role='driver'))

    user = User.query.get(user_id)
    profile = DriverProfile.query.filter_by(user_id=user_id).first()
    
    # Check if driver has clocked in today
    clocked_in = profile and profile.shift_status == 'on_duty'
    
    # Driver assigned tasks ordered by C++ VRP route index
    assigned_tasks = db.session.query(Task, Report).\
        join(Report, Task.report_id == Report.id).\
        filter(Task.driver_id == user_id, Task.status.in_(['assigned', 'en_route', 'arrived'])).\
        order_by(Task.route_sequence_index.asc()).all()

    completed_today = db.session.query(Task).\
        filter(Task.driver_id == user_id, Task.status == 'cleaned').count()

    return render_template(
        'driver/dashboard.html',
        user=user,
        profile=profile,
        clocked_in=clocked_in,
        tasks=assigned_tasks,
        completed_today=completed_today,
        lang=session.get('lang', 'en')
    )


@driver_bp.route('/driver/clock-in', methods=['POST'])
def clock_in():
    user_id = session.get('user_id')
    if not user_id or session.get('user_role') != 'driver':
        return redirect(url_for('auth.login', role='driver'))

    file = request.files.get('selfie')
    lat = float(request.form.get('lat', 21.1904))
    lng = float(request.form.get('lng', 81.2849))

    if not file or file.filename == '':
        return redirect(url_for('driver.dashboard'))

    filename = f"selfie_{uuid.uuid4().hex[:8]}_{secure_filename(file.filename)}"
    upload_folder = os.path.join(current_app.static_folder, 'uploads')
    os.makedirs(upload_folder, exist_ok=True)
    file_path = os.path.join(upload_folder, filename)
    file.save(file_path)

    # Save attendance clock-in record
    attendance = Attendance(
        driver_id=user_id,
        selfie_image_path=f"uploads/{filename}",
        clock_in_lat=lat,
        clock_in_lng=lng
    )
    db.session.add(attendance)

    # Update driver status
    profile = DriverProfile.query.filter_by(user_id=user_id).first()
    if profile:
        profile.shift_status = 'on_duty'
        profile.last_clock_in = datetime.utcnow()

    db.session.commit()
    return redirect(url_for('driver.dashboard'))


@driver_bp.route('/driver/submit-cleaning/<int:task_id>', methods=['GET', 'POST'])
def submit_cleaning(task_id):
    user_id = session.get('user_id')
    if not user_id or session.get('user_role') != 'driver':
        return redirect(url_for('auth.login', role='driver'))

    task = Task.query.get_or_404(task_id)
    report = Report.query.get(task.report_id)

    if request.method == 'POST':
        file = request.files.get('after_photo')
        driver_lat = float(request.form.get('driver_lat', report.gps_lat_user))
        driver_lng = float(request.form.get('driver_lng', report.gps_lng_user))

        if not file or file.filename == '':
            return render_template('driver/submit_cleaning.html', task=task, report=report, error="Please take an After photo.")

        filename = f"after_{uuid.uuid4().hex[:8]}_{secure_filename(file.filename)}"
        upload_folder = os.path.join(current_app.static_folder, 'uploads')
        os.makedirs(upload_folder, exist_ok=True)
        file_path = os.path.join(upload_folder, filename)
        file.save(file_path)

        # GPS cross-check distance between Driver and Reported location
        dist_m = AIService.calculate_haversine_distance(
            driver_lat, driver_lng,
            report.gps_lat_user, report.gps_lng_user
        )
        gps_verified = dist_m <= 150.0 # Driver is physically within 150m of reported spot

        # Save proof record
        proof = CleaningProof(
            task_id=task.id,
            driver_id=user_id,
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

        return redirect(url_for('driver.dashboard'))

    return render_template('driver/submit_cleaning.html', task=task, report=report, lang=session.get('lang', 'en'))
