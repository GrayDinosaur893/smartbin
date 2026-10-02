import sys
import os
import traceback

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

app = None
startup_error = None

try:
    from app import create_app
    app = create_app()
except Exception as e:
    startup_error = traceback.format_exc()
    print(f"[FATAL STARTUP ERROR] {startup_error}")
    from flask import Flask, jsonify, send_from_directory, render_template_string
    app = Flask(__name__)

    @app.route('/api/debug-startup')
    def debug_startup():
        return jsonify({
            'status': 'Startup Failed',
            'error': str(startup_error)
        }), 200

    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_fallback(path):
        static_dirs = [
            os.path.abspath(os.path.join(os.path.dirname(os.path.dirname(__file__)), 'public')),
            os.path.abspath(os.path.join(os.path.dirname(os.path.dirname(__file__)), 'frontend', 'dist')),
            os.path.abspath(os.path.join(os.path.dirname(os.path.dirname(__file__)), 'app', 'static')),
        ]
        if path:
            for d in static_dirs:
                file_path = os.path.normpath(os.path.join(d, path))
                if os.path.exists(file_path) and os.path.isfile(file_path):
                    return send_from_directory(d, path)

        for d in static_dirs:
            idx = os.path.join(d, 'index.html')
            if os.path.exists(idx):
                return send_from_directory(d, 'index.html')

        return render_template_string("""
        <!DOCTYPE html>
        <html>
        <head><title>SmartBin - Startup Notice</title></head>
        <body style="font-family:sans-serif;padding:40px;background:#0f172a;color:#f8fafc;">
            <h2>SmartBin Initialization Notice</h2>
            <pre style="background:#1e293b;padding:20px;border-radius:10px;color:#fca5a5;overflow:auto;">{{ error }}</pre>
        </body>
        </html>
        """, error=str(startup_error)), 200

if __name__ == '__main__':
    app.run()

