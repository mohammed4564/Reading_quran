from flask import Flask, render_template
from flask_cors import CORS

from routes.quran_pdf_router import (
    read_quran_pdf_router
)



app = Flask(__name__)
CORS(app)

app.register_blueprint(
    read_quran_pdf_router,
    url_prefix="/api/quran"
)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/read-quran")
def read_quran():
    return render_template("read_quran_pdf.html")




@app.route("/translation-quran")
def translation_quran():
    return render_template("translation_quran.html")

if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=5000)