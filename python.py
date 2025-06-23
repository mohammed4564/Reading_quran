from flask import Flask, render_template, send_from_directory

app = Flask(__name__)

# Sample data for Quran Paras
pdf_files = [
    {"name": "Para 1: Al-Fatiha", "arabic_name": "الفاتحة", "file": "Holy-Quran-Para-1.pdf"},
    {"name": "Para 2: Al-Baqarah", "arabic_name": "البقرة", "file": "Holy-Quran-Para-2.pdf"},
    {"name": "Para 3: Aal-E-Imran", "arabic_name": "آل عمران", "file": "Holy-Quran-Para-3.pdf"},
    {"name": "Para 4: An-Nisa", "arabic_name": "النساء", "file": "Holy-Quran-Para-4.pdf"},
    {"name": "Para 5: Al-Ma'idah", "arabic_name": "المائدة", "file": "Holy-Quran-Para-5.pdf"},
    {"name": "Para 6: Al-An'am", "arabic_name": "الأنعام", "file": "Holy-Quran-Para-6.pdf"},
    {"name": "Para 7: Al-A'raf", "arabic_name": "الأعراف", "file": "Holy-Quran-Para-7.pdf"},
    {"name": "Para 8: Al-Anfal", "arabic_name": "الأنفال", "file": "Holy-Quran-Para-8.pdf"},
    {"name": "Para 9: At-Tawbah", "arabic_name": "التوبة", "file": "Holy-Quran-Para-9.pdf"},
    {"name": "Para 10: Yunus", "arabic_name": "يونس", "file": "Holy-Quran-Para-10.pdf"},
    {"name": "Para 11: Hud", "arabic_name": "هود", "file": "Holy-Quran-Para-11.pdf"},
    {"name": "Para 12: Yusuf", "arabic_name": "يوسف", "file": "Holy-Quran-Para-12.pdf"},
    {"name": "Para 13: Ibrahim", "arabic_name": "إبراهيم", "file": "Holy-Quran-Para-13.pdf"},
    {"name": "Para 14: Al-Hijr", "arabic_name": "الحجر", "file": "Holy-Quran-Para-14.pdf"},
    {"name": "Para 15: An-Nahl", "arabic_name": "النحل", "file": "Holy-Quran-Para-15.pdf"},
    {"name": "Para 16: Al-Isra", "arabic_name": "الإسراء", "file": "Holy-Quran-Para-16.pdf"},
    {"name": "Para 17: Al-Kahf", "arabic_name": "الكهف", "file": "Holy-Quran-Para-17.pdf"},
    {"name": "Para 18: Maryam", "arabic_name": "مريم", "file": "Holy-Quran-Para-18.pdf"},
    {"name": "Para 19: Ta-Ha", "arabic_name": "طه", "file": "Holy-Quran-Para-19.pdf"},
    {"name": "Para 20: Al-Anbiya", "arabic_name": "الأنبياء", "file": "Holy-Quran-Para-20.pdf"},
    {"name": "Para 21: Al-Hajj", "arabic_name": "الحج", "file": "Holy-Quran-Para-21.pdf"},
    {"name": "Para 22: Al-Mu'minun", "arabic_name": "المؤمنون", "file": "Holy-Quran-Para-22.pdf"},
    {"name": "Para 23: An-Nur", "arabic_name": "النور", "file": "Holy-Quran-Para-23.pdf"},
    {"name": "Para 24: Al-Furqan", "arabic_name": "الفرقان", "file": "Holy-Quran-Para-24.pdf"},
    {"name": "Para 25: Ash-Shu'ara", "arabic_name": "الشعراء", "file": "Holy-Quran-Para-25.pdf"},
    {"name": "Para 26: An-Naml", "arabic_name": "النمل", "file": "Holy-Quran-Para-26.pdf"},
    {"name": "Para 27: Al-Ahqaf", "arabic_name": "الأحقاف", "file": "Holy-Quran-Para-27.pdf"},
    {"name": "Para 28: Az-Zariyat", "arabic_name": "الذاريات", "file": "Holy-Quran-Para-28.pdf"},
    {"name": "Para 29: Al-Mujadila", "arabic_name": "المجادلة", "file": "Holy-Quran-Para-29.pdf"},
    {"name": "Para 30: Al-Buruj", "arabic_name": "البروج", "file": "Holy-Quran-Para-30.pdf"}
]

@app.route('/')
def home():
    return render_template("home.html", paras=pdf_files)

@app.route('/download/<filename>')
def download_file(filename):
    return send_from_directory('static/pdf', filename, as_attachment=True)

if __name__ == '__main__':
    app.run(debug=True)
