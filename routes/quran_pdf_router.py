from flask import Blueprint

from controllers.quran_pdf_controller import (
    get_quran_pdf,
    get_all_paras
)


read_quran_pdf_router = Blueprint(
    "read_quran_pdf_router",
    __name__
)

read_quran_pdf_router.add_url_rule(
    "/paras",
    view_func=get_all_paras,
    methods=["GET"]
)


read_quran_pdf_router.add_url_rule(
    "/paras/<int:para_id>",
    view_func=get_quran_pdf,
    methods=["GET"]
)