from fastapi import FastAPI
from swa_api import database
app = FastAPI()


@app.get("/api/hello")
async def root():
    return {"message": "Hello World"}
    