from fastapi import FastAPI
from swa_api import database
app = FastAPI(docs_url="/api/.docs", openapi_url="/api/openapi.json")


@app.get("/api/hello")
async def root():
    return {"message": "Hello World"}
