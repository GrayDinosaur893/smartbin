import csv
import io
from datetime import datetime
from flask import Blueprint, request, render_template, redirect, url_for, session, make_response, jsonify
from app.database import db
from app.models.models import User, Report, Dustbin, Task, DriverProfile, Attendance, CleaningProof, RewardsLedger
from app.services.vrp_service import VRPService

admin_bp = Blueprint('admin', __name__)
vrp_service = VRPService()

@admin_bp.route('/admin/dashboard')
def dashboard():
    user_id = session.get('user_id')
    if not user_id or session.get('user_role') != 'admin':
        return redirect(url_for('auth.login', role='admin'))

    # Live Snapshot KPI Stats
    reports_today = Report.query.count()
    pending_review = Report.query.filter(Report.status.in_(['pending_ai', 'uncertain'])).count()
    assigned_tasks = Task.query.filter_by(status='assigned').count()
    cleaned_today = Report.query.filter_by(status='completed').count()

    # Attention Required Alerts
    unverified_reports = Report.query.filter_by(status='uncertain').all()
    high_priority_overflow = Report.query.filter_by(severity='high', status='verified').all()
    inactive_drivers = DriverProfile.query.filter_by(shift_status='off_duty').all()
    illegal_dumping_reports = Report.query.filter_by(is_illegal_dumping=True).all()

    # Live Map & Recent Reports
    reports = Report.query.order_by(Report.created_at.desc()).limit(15).all()
    dustbins = Dustbin.query.all()
    drivers = User.query.filter_by(role='driver').all()

    current_date = datetime.now().strftime("%A, %d %B %Y")

    return render_template(
        'admin/dashboard.html',
        current_date=current_date,
        reports_today=reports_today,
        pending_review=pending_review,
        assigned_tasks=assigned_tasks,
        cleaned_today=cleaned_today,
        unverified_reports=unverified_reports,
        high_priority_overflow=high_priority_overflow,
        inactive_drivers=inactive_drivers,
        illegal_dumping_reports=illegal_dumping_reports,
        reports=reports,
        dustbins=dustbins,
        drivers=drivers
    )


@admin_bp.route('/admin/optimize-routes', methods=['POST'])
def optimize_routes():
    """Triggers C++ VRP Engine for high-speed route optimization & assigns tasks to selected driver."""
    user_id = session.get('user_id')
    if not user_id or session.get('user_role') != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403

    driver_user_id = int(request.form.get('driver_id', 0))
    if not driver_user_id:
        return redirect(url_for('admin.dashboard'))

    # Driver depot / start location (Durg Depot)
    driver_start = {'id': 0, 'lat': 21.1904, 'lng': 81.2849, 'urgency': 1}

    # Fetch verified reports needing collection
    unassigned_reports = Report.query.filter(Report.status.in_(['verified', 'uncertain'])).all()
    if not unassigned_reports:
        return redirect(url_for('admin.dashboard'))

    stops = []
    for r in unassigned_reports:
        urgency_val = 3 if r.is_illegal_dumping or r.severity == 'high' else (2 if r.severity == 'medium' else 1)
        stops.append({
            'id': r.id,
            'lat': r.gps_lat_user,
            'lng': r.gps_lng_user,
            'urgency': urgency_val
        })

    # Call C++ VRP Solver Engine
    opt_result = vrp_service.optimize_route(driver_start, stops)
    ordered_ids = opt_result['ordered_ids']

    # Assign tasks to driver with C++ computed route sequence index
    for seq_index, report_id in enumerate(ordered_ids):
        existing_task = Task.query.filter_by(report_id=report_id).first()
        if not existing_task:
            task_code = f"#TSK-{1000 + Task.query.count() + 1}"
            new_task = Task(
                task_code=task_code,
                report_id=report_id,
                driver_id=driver_user_id,
                route_sequence_index=seq_index + 1,
                status='assigned'
            )
            db.session.add(new_task)
        else:
            existing_task.driver_id = driver_user_id
            existing_task.route_sequence_index = seq_index + 1
            existing_task.status = 'assigned'

        rep = Report.query.get(report_id)
        if rep:
            rep.status = 'assigned'

    db.session.commit()
    return redirect(url_for('admin.dashboard'))


@admin_bp.route('/admin/export-csv')
def export_csv():
    user_id = session.get('user_id')
    if not user_id or session.get('user_role') != 'admin':
        return redirect(url_for('auth.login'))

    reports = Report.query.order_by(Report.created_at.desc()).all()
    
    si = io.StringIO()
    cw = csv.writer(si)
    cw.writerow(['Report ID', 'Waste Type', 'Severity', 'Illegal Dumping', 'AI Score', 'Status', 'Lat', 'Lng', 'Created At'])

    for r in reports:
        cw.writerow([
            r.report_code, r.waste_type, r.severity,
            'YES' if r.is_illegal_dumping else 'NO',
            f"{r.ai_confidence}%", r.status,
            r.gps_lat_user, r.gps_lng_user, r.created_at.strftime("%Y-%m-%d %H:%M")
        ])

    output = make_response(si.getvalue())
    output.headers["Content-Disposition"] = "attachment; filename=SmartBin_Municipal_Report.csv"
    output.headers["Content-type"] = "text/csv"
    return output
