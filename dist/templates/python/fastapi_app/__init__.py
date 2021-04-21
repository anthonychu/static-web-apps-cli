import logging

import azure.functions as func
import os.path

dir_path = os.path.dirname(os.path.realpath(__file__))

if (os.path.isfile(os.path.join(dir_path, "..", "..", "api", "main.py"))):
    print("Debugging original source")
    import sys
    sys.path.append(os.path.join(dir_path, "..", ".."))
    from api.main import app
else:
    print("Debugging copied source")
    from ..main import app

from ._http_asgi import AsgiMiddleware

def main(req: func.HttpRequest, context: func.Context) -> func.HttpResponse:
    return AsgiMiddleware(app).handle(req, context)