import os
import joblib
import pandas as pd
from fastapi import HTTPException

# Locate the pipeline pickle file
PIPELINE_PATH = os.path.join(
    os.path.dirname(__file__),
    "../../ml_training/notebooks/irrigation_pipeline.pkl"
)

# Cache the loaded pipeline as a singleton
_pipeline = None

def get_pipeline():
    global _pipeline
    if _pipeline is None:
        if not os.path.exists(PIPELINE_PATH):
            raise HTTPException(
                status_code=500,
                detail=f"Model pipeline not found at {PIPELINE_PATH}"
            )
        _pipeline = joblib.load(PIPELINE_PATH)
    return _pipeline

# Statistical mean of Previous_Irrigation_mm in the training dataset (used as default)
PREVIOUS_IRRIGATION_DEFAULT = 62.3

# Mappers to standardize categories to match model training categories
SOIL_TYPE_MAP = {
    "sandy": "Sandy",
    "clay": "Clay",
    "loamy": "Loamy",
    "limon": "Silt",
    "silt": "Silt"
}

CROP_TYPE_MAP = {
    "sugarcane": "Sugarcane",
    "wheat": "Wheat",
    "rice": "Rice",
    "potato": "Potato",
    "cotton": "Cotton",
    "maize": "Maize",
    "corn": "Maize"
}

CROP_GROWTH_STAGE_MAP = {
    "sowing": "Sowing",
    "vegetative": "Vegetative",
    "flowering": "Flowering",
    "harvest": "Harvest"
}

IRRIGATION_TYPE_MAP = {
    "drip": "Drip",
    "rainfed": "Rainfed",
    "sprinkler": "Sprinkler",
    "canal": "Canal"
}

def predict_irrigation(
    soil_type: str,
    soil_ph: float,
    soil_moisture: float,
    organic_carbon: float,
    temperature: float,
    humidity: float,
    rainfall: float,
    wind_speed: float,
    sunlight_hours: float,
    crop_type: str,
    crop_growth_stage: str,
    irrigation_type: str,
    field_area_hectare: float,
    mulching_used: str,
    previous_irrigation: float = PREVIOUS_IRRIGATION_DEFAULT
) -> tuple[str, float, dict]:
    """
    Standardizes inputs, builds a dataframe in the exact order expected by the pipeline,
    and returns a tuple (prediction, confidence, probabilities_dict).
    """
    pipeline = get_pipeline()
    
    # 1. Standardize values
    std_soil_type = SOIL_TYPE_MAP.get(str(soil_type).strip().lower(), "Loamy")
    std_crop_type = CROP_TYPE_MAP.get(str(crop_type).strip().lower(), "Wheat")
    std_crop_growth_stage = CROP_GROWTH_STAGE_MAP.get(str(crop_growth_stage).strip().lower(), "Vegetative")
    std_irrigation_type = IRRIGATION_TYPE_MAP.get(str(irrigation_type).strip().lower(), "Drip")
    
    # Map mulching
    mulch_str = str(mulching_used).strip().lower()
    if mulch_str in ("yes", "true", "1", "y", "oui"):
        std_mulching = "Yes"
    else:
        std_mulching = "No"
         
    # Standardize numericals (prevent Nulls from crashing pandas or sklearn)
    val_soil_ph = float(soil_ph) if soil_ph is not None else 6.5
    val_organic_carbon = float(organic_carbon) if organic_carbon is not None else 0.5
    
    # 2. Build the exact feature structure
    data = {
        "Soil_Type": [std_soil_type],
        "Soil_pH": [val_soil_ph],
        "Soil_Moisture": [float(soil_moisture)],
        "Organic_Carbon": [val_organic_carbon],
        "Temperature_C": [float(temperature)],
        "Humidity": [float(humidity)],
        "Rainfall_mm": [float(rainfall)],
        "Sunlight_Hours": [float(sunlight_hours)],
        "Wind_Speed_kmh": [float(wind_speed)],
        "Crop_Type": [std_crop_type],
        "Crop_Growth_Stage": [std_crop_growth_stage],
        "Irrigation_Type": [std_irrigation_type],
        "Field_Area_hectare": [float(field_area_hectare)],
        "Mulching_Used": [std_mulching],
        "Previous_Irrigation_mm": [float(previous_irrigation)]
    }
    
    df = pd.DataFrame(data)
    
    # Ensure columns match training order exactly
    feature_order = [
        "Soil_Type", "Soil_pH", "Soil_Moisture", "Organic_Carbon",
        "Temperature_C", "Humidity", "Rainfall_mm", "Sunlight_Hours", "Wind_Speed_kmh",
        "Crop_Type", "Crop_Growth_Stage", "Irrigation_Type", "Field_Area_hectare",
        "Mulching_Used", "Previous_Irrigation_mm"
    ]
    df = df[feature_order]
    
    # 3. Predict & compute confidence
    try:
        prediction_arr = pipeline.predict(df)
        prediction = str(prediction_arr[0])
        
        # Calculate confidence and full probability distribution
        probs = pipeline.predict_proba(df)[0]
        classes = pipeline.classes_ if hasattr(pipeline, "classes_") else pipeline.named_steps["classifier"].classes_
        classes_list = list(classes)
        pred_idx = classes_list.index(prediction)
        confidence = float(probs[pred_idx])
        
        # Build a dict {CLASS_UPPER: probability} for all classes
        probabilities = {str(cls).upper(): float(p) for cls, p in zip(classes_list, probs)}
        
        return prediction, confidence, probabilities
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Model prediction failed: {str(e)}"
        )
