import logging

import azure.functions as func
from ..main import app
from ._http_asgi import AsgiMiddleware

def main(req: func.HttpRequest, context: func.Context) -> func.HttpResponse:
    return AsgiMiddleware(app).handle(req, context)