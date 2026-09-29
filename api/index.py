import sys
import os

# Add root directory to python path for Vercel Serverless Function
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from app import create_app
    app = create_app()
except Exception as e:
    import traceback
    err_str = traceback.format_exc()
    from flask import Flask, jsonify
    app = Flask(__name__)
    
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def fallback_err(path):
        return jsonify({
            'status': 'Startup Notice',
            'detail': str(err_str)
        }), 500

if __name__ == '__main__':
    app.run()
