import sys
import os

# Add root directory to python path for Vercel Serverless Function
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app

app = create_app()

if __name__ == '__main__':
    app.run()
