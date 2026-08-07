from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime

from app.dependencies import get_db, get_current_user
from app.models.agriculteur import Agriculteur
from app.models.exploitation import Exploitation
from app.models.parcelle import Parcelle
from app.models.parcel_profile import ParcelProfile
from app.models.recommandation import PredictionHistory

from app.schemas.recommandation import (
    PredictRequest,
    PredictResponse,
    ParcelOptionResponse,
    HistoryRecordResponse,
    LatestPredictionInfo,
    WeatherInfo
)

from app.services.weather_service import get_today_weather
from app.services.prediction_service import predict_irrigation

router = APIRouter(prefix="/recommendation", tags=["Recommendation"])


@router.get("/parcels", response_model=list[ParcelOptionResponse])
def get_recommendation_parcels(
    db: Session = Depends(get_db),
    current_user: Agriculteur = Depends(get_current_user)
):
    # 1. Fetch all parcels owned by the current farmer
    parcelles = (
        db.query(Parcelle)
        .options(joinedload(Parcelle.profile))
        .join(Exploitation)
        .filter(Exploitation.id_agriculteur == current_user.id_agriculteur)
        .all()
    )
    
    result = []
    for p in parcelles:
        # 2. Query the latest prediction for this parcel
        latest_pred = (
            db.query(PredictionHistory)
            .filter(PredictionHistory.parcel_id == p.id_parcelle)
            .order_by(PredictionHistory.predicted_at.desc())
            .first()
        )
        
        latest_pred_info = None
        if latest_pred:
            latest_pred_info = LatestPredictionInfo(
                prediction=latest_pred.prediction.upper(),  # HIGH, MEDIUM, LOW
                confidence=latest_pred.confidence,
                predicted_at=latest_pred.predicted_at
            )
            
        profile = p.profile
        result.append(
            ParcelOptionResponse(
                id_parcelle=p.id_parcelle,
                nom=p.nom,
                superficie=p.superficie,
                latitude=p.latitude,
                longitude=p.longitude,
                soil_type=profile.soil_type if profile else None,
                crop_type=profile.crop_type if profile else None,
                organic_carbon=profile.organic_carbon if profile else None,
                soil_ph=profile.soil_ph if profile else None,
                crop_growth_stage=profile.crop_growth_stage if profile else None,
                irrigation_type=profile.irrigation_type if profile else None,
                mulching_used=profile.mulching_used if profile else None,
                latest_prediction=latest_pred_info
            )
        )
    return result


@router.post("/predict", response_model=PredictResponse)
def post_predict(
    req: PredictRequest,
    db: Session = Depends(get_db),
    current_user: Agriculteur = Depends(get_current_user)
):
    # 1. Verify parcel exists and belongs to current user
    parcel = (
        db.query(Parcelle)
        .options(joinedload(Parcelle.profile))
        .join(Exploitation)
        .filter(
            Parcelle.id_parcelle == req.parcel_id,
            Exploitation.id_agriculteur == current_user.id_agriculteur
        )
        .first()
    )
    if not parcel:
        raise HTTPException(
            status_code=404,
            detail="Parcel not found or you do not own this parcel"
        )
        
    profile = parcel.profile
    if not profile:
        raise HTTPException(
            status_code=400,
            detail="Parcel profile not set up yet. Please add soil and crop details to this parcel."
        )

    # 2. Fetch current weather from Open-Meteo
    weather_data = get_today_weather(parcel.latitude, parcel.longitude)
    
    # 3. Call prediction service
    prediction_raw, confidence, probabilities = predict_irrigation(
        soil_type=profile.soil_type,
        soil_ph=profile.soil_ph,
        soil_moisture=req.soil_moisture,
        organic_carbon=profile.organic_carbon,
        temperature=weather_data["temperature"],
        humidity=weather_data["humidity"],
        rainfall=weather_data["rainfall"],
        wind_speed=weather_data["wind_speed"],
        sunlight_hours=weather_data["sunlight_hours"],
        crop_type=profile.crop_type,
        crop_growth_stage=profile.crop_growth_stage,
        irrigation_type=profile.irrigation_type,
        field_area_hectare=parcel.superficie,
        mulching_used=profile.mulching_used,
        previous_irrigation=req.previous_irrigation
    )
    
    prediction_upper = prediction_raw.upper() # HIGH, MEDIUM, LOW
    
    # Map recommendation messages
    if prediction_upper == "HIGH":
        msg = "Irrigation is recommended today."
    elif prediction_upper == "MEDIUM":
        msg = "Monitor the soil before irrigating."
    else:
        msg = "No irrigation required today."

    # 4. Get previous prediction to compare
    prev_pred_record = (
        db.query(PredictionHistory)
        .filter(PredictionHistory.parcel_id == parcel.id_parcelle)
        .order_by(PredictionHistory.predicted_at.desc())
        .first()
    )
    
    prev_prediction_val = None
    if prev_pred_record:
        prev_prediction_val = prev_pred_record.prediction.upper()
        
    # Check if prediction changed
    prediction_changed = (
        prev_prediction_val is not None and prev_prediction_val != prediction_upper
    )
    
    # 5. Create new history entry
    new_history = PredictionHistory(
        parcel_id=parcel.id_parcelle,
        soil_moisture=req.soil_moisture,
        temperature=weather_data["temperature"],
        humidity=weather_data["humidity"],
        rainfall=weather_data["rainfall"],
        wind_speed=weather_data["wind_speed"],
        sunlight_hours=weather_data["sunlight_hours"],
        prediction=prediction_upper,
        confidence=confidence,
        previous_prediction=prev_prediction_val,
        notification_sent=prediction_changed
    )
    
    try:
        db.add(new_history)
        db.commit()
        db.refresh(new_history)
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save prediction history: {str(e)}"
        )
        
    return PredictResponse(
        prediction=prediction_upper,
        confidence=confidence,
        recommendation_message=msg,
        timestamp=new_history.predicted_at,
        previous_prediction=prev_prediction_val,
        parcel_name=parcel.nom,
        probabilities=probabilities,
        weather=WeatherInfo(
            temperature=weather_data["temperature"],
            humidity=weather_data["humidity"],
            rainfall=weather_data["rainfall"],
            wind_speed=weather_data["wind_speed"],
            sunlight_hours=weather_data["sunlight_hours"]
        )
    )


@router.get("/history/{parcelId}", response_model=list[HistoryRecordResponse])
def get_prediction_history(
    parcelId: int,
    db: Session = Depends(get_db),
    current_user: Agriculteur = Depends(get_current_user)
):
    # 1. Verify parcel ownership
    parcel = (
        db.query(Parcelle)
        .join(Exploitation)
        .filter(
            Parcelle.id_parcelle == parcelId,
            Exploitation.id_agriculteur == current_user.id_agriculteur
        )
        .first()
    )
    if not parcel:
        raise HTTPException(
            status_code=404,
            detail="Parcel not found or you do not own this parcel"
        )
        
    # 2. Fetch history records newest first
    records = (
        db.query(PredictionHistory)
        .filter(PredictionHistory.parcel_id == parcelId)
        .order_by(PredictionHistory.predicted_at.desc())
        .all()
    )
    
    return [
        HistoryRecordResponse(
            id=r.id,
            soil_moisture=r.soil_moisture,
            temperature=r.temperature,
            humidity=r.humidity,
            rainfall=r.rainfall,
            wind_speed=r.wind_speed,
            sunlight_hours=r.sunlight_hours,
            prediction=r.prediction.upper(),
            confidence=r.confidence,
            previous_prediction=r.previous_prediction,
            predicted_at=r.predicted_at,
            notification_sent=r.notification_sent
        ) for r in records
    ]
