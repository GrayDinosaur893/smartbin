import os
from flask import Flask, send_from_directory
from flask_cors import CORS
from app.database import db

# Load environment variables from .env file if available
try:
    from dotenv import load_dotenv
    env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
    if os.path.exists(env_path):
        load_dotenv(env_path)
except ImportError:
    pass

def create_app():
    dist_dir = os.path.join(os.path.dirname(__file__), 'static')
    app = Flask(__name__, static_folder=dist_dir, static_url_path='')
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'smartbin_secret_key_2026_bilaspur')
    
    # Neon PostgreSQL Connection URI
    default_db = 'postgresql://neondb_owner:npg_mGDv5Rk6ZqhY@ep-muddy-glade-ae3omptd-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require'
    db_uri = os.environ.get('DATABASE_URL', default_db)
    
    if db_uri and db_uri.startswith("postgres://"):
        db_uri = db_uri.replace("postgres://", "postgresql://", 1)

    app.config['SQLALCHEMY_DATABASE_URI'] = db_uri
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
        "pool_pre_ping": True,
        "pool_recycle": 280,
        "pool_timeout": 20,
    }

    CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True) # Enable Cross-Origin Resource Sharing for Vite React Frontend
    db.init_app(app)

    with app.app_context():
        try:
            db.create_all()
        except Exception as e:
            print(f"[Database Init Notice] {e}")

    # Register REST API Blueprints
    from app.routes.api_routes import api_bp
    app.register_blueprint(api_bp, url_prefix='/api')

    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_spa(path):
        if path and os.path.exists(os.path.join(dist_dir, path)):
            return send_from_directory(dist_dir, path)
        if os.path.exists(os.path.join(dist_dir, 'index.html')):
            return send_from_directory(dist_dir, 'index.html')
        return "SmartBin CG Server Active", 200

    return app
