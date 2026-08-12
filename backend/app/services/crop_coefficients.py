"""Reviewable agronomic configuration used by the irrigation calculator.

Kc values are FAO-56 style mid-season/initial/end-stage planning values. Crop
names and stages are normalized using the same vocabulary as prediction_service.
Unknown values use the conservative generic defaults instead of failing a
recommendation.
"""

CROP_KC = {
    "Tomato": {"Sowing": 0.60, "Vegetative": 0.85, "Flowering": 1.15, "Harvest": 0.80},
    "Wheat": {"Sowing": 0.35, "Vegetative": 0.75, "Flowering": 1.15, "Harvest": 0.40},
    "Maize": {"Sowing": 0.40, "Vegetative": 0.80, "Flowering": 1.20, "Harvest": 0.60},
    "Rice": {"Sowing": 1.05, "Vegetative": 1.10, "Flowering": 1.20, "Harvest": 0.90},
    "Potato": {"Sowing": 0.50, "Vegetative": 0.80, "Flowering": 1.15, "Harvest": 0.75},
    "Cotton": {"Sowing": 0.35, "Vegetative": 0.80, "Flowering": 1.15, "Harvest": 0.70},
    "Sugarcane": {"Sowing": 0.40, "Vegetative": 0.90, "Flowering": 1.15, "Harvest": 0.75},
}

DEFAULT_KC = 1.0

# These are planning assumptions, not measured soil-water properties.
SOIL_MOISTURE_CONFIG = {
    "wilting_point_percent": 20.0,
    "field_capacity_percent": 40.0,
    "root_zone_depth_mm": 300.0,
}

# Representative application efficiencies; keep centralized for agronomic review.
IRRIGATION_EFFICIENCY = {"Drip": 0.90, "Sprinkler": 0.75, "Flood": 0.60, "Canal": 0.60, "Rainfed": 1.0}

# The classifier decides whether to irrigate. This only scales the estimated
# amount after classification and makes that contract explicit.
# The ML label must never erase the agronomic quantity. It describes urgency;
# these factors provide a transparent planning adjustment while preserving a
# small baseline estimate for LOW/MEDIUM results.
PREDICTION_DEMAND_FACTOR = {"LOW": 0.35, "MEDIUM": 0.70, "HIGH": 1.0}
