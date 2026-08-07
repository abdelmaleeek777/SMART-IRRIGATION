from fastapi import FastAPI
from app.routers import auth, exploitations, parcelles, recommandations
from app.database import Base, engine
from fastapi.middleware.cors import CORSMiddleware


# Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
     allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth.router)
app.include_router(exploitations.router)
app.include_router(parcelles.router)
app.include_router(recommandations.router)


@app.get("/")
def first_function():
    return {"message": "Hello World"}
