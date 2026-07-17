from fastapi import FastAPI
from app.routers import auth
from app.database import Base,engine

# Base.metadata.create_all(bind=engine)

app = FastAPI()
app.include_router(auth.router)


@app.get("/")
def first_function():
    return {"message": "Hello World"}
