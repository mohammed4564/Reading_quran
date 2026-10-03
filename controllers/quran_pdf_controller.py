import csv
import os

from flask import jsonify, send_from_directory


BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)


CSV_FILE = os.path.join(
    BASE_DIR,
    "static",
    "pdf",
    "quran_paras.csv"
)


PDF_FOLDER = os.path.join(
    BASE_DIR,
    "static",
    "pdf"
)


def get_all_paras():

    if not os.path.isfile(CSV_FILE):

        return jsonify({
            "success": False,
            "message": "Quran CSV not found"
        }), 404


    paras = []


    with open(
        CSV_FILE,
        "r",
        encoding="utf-8-sig",
        newline=""
    ) as file:

        reader = csv.reader(file)


        for row in reader:

            # Skip empty rows
            if not row:
                continue


            # Skip header
            if row[0].strip().upper() == "ID":
                continue


            # Skip invalid rows
            if len(row) < 4:
                continue


            paras.append({
                "id": row[0].strip(),
                "english_name": row[1].strip(),
                "arabic_name": row[2].strip(),
                "file_path": row[3].strip()
            })


    return jsonify({
        "success": True,
        "count": len(paras),
        "data": paras
    })


def get_quran_pdf(para_id):

    filename = f"Holy-Quran-Para-{para_id}.pdf"


    pdf_path = os.path.join(
        PDF_FOLDER,
        filename
    )


    if not os.path.isfile(pdf_path):

        return jsonify({
            "success": False,
            "message": "Quran PDF not found"
        }), 404


    return send_from_directory(
        PDF_FOLDER,
        filename,
        mimetype="application/pdf"
    )