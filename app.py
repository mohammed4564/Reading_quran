from flask import Flask, render_template, send_from_directory, session, request, jsonify
from flask_cors import CORS
import os
import uuid
import json

app = Flask(__name__)
app.secret_key = '74236873dsagdjagsd8shagdjd7823'  # Change this to a secure random key in production
CORS(app)

# Ensure directories exist
PDF_BASE_DIR = 'static/pdf'
USER_PDF_DIR = 'user_pdfs'

os.makedirs(PDF_BASE_DIR, exist_ok=True)
os.makedirs(USER_PDF_DIR, exist_ok=True)

def get_user_dir():
    """Get or create user-specific directory based on session"""
    if 'user_id' not in session:
        session['user_id'] = str(uuid.uuid4())
    
    user_dir = os.path.join(USER_PDF_DIR, session['user_id'])
    os.makedirs(user_dir, exist_ok=True)
    return user_dir

@app.route('/')
def home():
    return render_template("home.html")

@app.route('/quran-reader')
def quran_reader():
    return render_template("quran_reader.html")

@app.route('/audio-recitation')
def audio_recitation():
    return render_template("audio_quran.html")

@app.route('/static/pdf/<path:filename>')
def serve_pdf(filename):
    """Serve base PDF files for viewing"""
    return send_from_directory(PDF_BASE_DIR, filename)

@app.route('/api/reading-progress', methods=['GET', 'POST'])
def reading_progress():
    """Save or get user's reading progress"""
    user_dir = get_user_dir()
    progress_file = os.path.join(user_dir, 'reading_progress.json')
    
    if request.method == 'POST':
        data = request.json
        with open(progress_file, 'w') as f:
            json.dump(data, f)
        return jsonify({'status': 'success'})
    else:
        if os.path.exists(progress_file):
            with open(progress_file, 'r') as f:
                progress = json.load(f)
            return jsonify(progress)
        return jsonify({})

@app.route('/api/user-info')
def user_info():
    """Get current user info"""
    return jsonify({
        'user_id': session.get('user_id')
    })

@app.route('/reset-progress')
def reset_progress():
    """Reset user's reading progress"""
    user_dir = get_user_dir()
    progress_file = os.path.join(user_dir, 'reading_progress.json')
    if os.path.exists(progress_file):
        os.remove(progress_file)
    return jsonify({'status': 'success'})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)