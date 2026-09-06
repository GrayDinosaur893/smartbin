from flask import Blueprint, request, jsonify, render_template, redirect, url_for, session
from werkzeug.security import generate_password_hash, check_password_hash
from app.database import db
from app.models.models import User, DriverProfile

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        data = request.form or request.get_json()
        email = data.get('email')
        password = data.get('password')
        target_role = data.get('role', 'citizen')

        user = User.query.filter_by(email=email).first()
        if user and check_password_hash(user.password_hash, password):
            session['user_id'] = user.id
            session['user_name'] = user.name
            session['user_role'] = user.role
            session['lang'] = user.language_preference or 'en'

            if user.role == 'admin':
                return redirect(url_for('admin.dashboard'))
            elif user.role == 'driver':
                return redirect(url_for('driver.dashboard'))
            else:
                return redirect(url_for('citizen.dashboard'))
        
        return render_template('auth/login.html', error="Invalid email or password", role=target_role)

    role = request.args.get('role', 'citizen')
    return render_template('auth/login.html', role=role)


@auth_bp.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        data = request.form or request.get_json()
        name = data.get('name')
        email = data.get('email')
        phone = data.get('phone')
        password = data.get('password')
        role = data.get('role', 'citizen')

        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            return render_template('auth/register.html', error="Email already registered")

        hashed_pw = generate_password_hash(password)
        new_user = User(
            name=name,
            email=email,
            phone=phone,
            password_hash=hashed_pw,
            role=role,
            eco_points=100, # Registration bonus
            cash_wallet_balance=20.0 # Welcome cash bonus
        )
        db.session.add(new_user)
        db.session.commit()

        if role == 'driver':
            driver_prof = DriverProfile(
                user_id=new_user.id,
                vehicle_number="CG-07-G-1042",
                vehicle_type="Garbage Truck 4T",
                assigned_zone="Durg Municipal Zone"
            )
            db.session.add(driver_prof)
            db.session.commit()

        session['user_id'] = new_user.id
        session['user_name'] = new_user.name
        session['user_role'] = new_user.role
        session['lang'] = 'en'

        if role == 'admin':
            return redirect(url_for('admin.dashboard'))
        elif role == 'driver':
            return redirect(url_for('driver.dashboard'))
        else:
            return redirect(url_for('citizen.dashboard'))

    return render_template('auth/register.html')


@auth_bp.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('citizen.home'))


@auth_bp.route('/toggle-lang/<lang>')
def toggle_lang(lang):
    if lang in ['en', 'hi']:
        session['lang'] = lang
        user_id = session.get('user_id')
        if user_id:
            user = User.query.get(user_id)
            if user:
                user.language_preference = lang
                db.session.commit()
    return redirect(request.referrer or url_for('citizen.home'))
