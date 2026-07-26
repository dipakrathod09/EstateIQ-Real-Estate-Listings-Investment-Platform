from fastapi import FastAPI
from pydantic import BaseModel, Field
from typing import Optional

app = FastAPI(
    title="EstateIQ ML Microservice",
    description="Microservice wrapping real estate price-prediction models",
    version="1.0.0"
)

class PropertyFeaturePayload(BaseModel):
    bedrooms: int = Field(..., example=3, description="Number of bedrooms")
    bathrooms: float = Field(..., example=2.5, description="Number of bathrooms")
    sqft: float = Field(..., example=1850.0, description="Total square footage")
    location: str = Field(..., example="Beverly Hills, CA", description="City or neighborhood location")
    property_type: Optional[str] = Field("single_family", example="single_family", description="Type of property")

class PricePredictionResponse(BaseModel):
    predicted_price: float
    currency: str
    confidence_score: float
    status: str
    model_version: str

@app.get("/health")
def health_check():
    """Health check endpoint for ML microservice."""
    return {
        "status": "ok",
        "service": "EstateIQ ML Microservice",
        "version": "1.0.0"
    }

@app.post("/predict-price", response_model=PricePredictionResponse)
def predict_price(payload: PropertyFeaturePayload):
    """
    Price prediction stub endpoint.
    Returns estimated valuation based on property parameters.
    """
    # Hardcoded pricing calculation stub for Phase 0 proof-of-concept
    base_price = payload.sqft * 350.0 + (payload.bedrooms * 25000) + (payload.bathrooms * 15000)
    
    return PricePredictionResponse(
        predicted_price=round(base_price, 2),
        currency="USD",
        confidence_score=0.92,
        status="stub_prediction_phase0",
        model_version="v0.1-stub"
    )
