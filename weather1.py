from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from langchain_groq import ChatGroq
from pydantic import BaseModel
import os
import requests
import json
import re
from typing import List, Dict, Any
from dotenv import load_dotenv

load_dotenv()

os.environ["GROQ_API_KEY"] = os.getenv("GROQ_API_KEY")
WEATHER_API_KEY = os.getenv("WEATHER_API_KEY")

app = FastAPI()

# Add CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class WeatherRequest(BaseModel):
    city: str

class WeatherData(BaseModel):
    city: str
    temperature: int
    condition: str
    humidity: int
    windSpeed: int
    visibility: int
    description: str

class Activity(BaseModel):
    name: str
    description: str
    category: str
    rating: float
    duration: str
    bestTime: str

class WeatherResponse(BaseModel):
    weather: WeatherData
    activities: List[Activity]

llm = ChatGroq(model="Gemma2-9b-It")

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

output = StrOutputParser()

# Fixed prompt template with proper variable names
prompt = ChatPromptTemplate.from_messages([
    ("system", """You are a helpful assistant that provides weather-based activity recommendations. 
    Based on the weather data provided, suggest 5 activities that are suitable for the current conditions.
    
    For each activity, provide:
    - name: A catchy name for the activity
    - description: A brief description (1-2 sentences)
    - category: One of these categories: Adventure, Creative, Food & Drink, Culture, Leisure, Indoor, Outdoor
    - rating: A rating between 4.0 and 5.0 (one decimal place)
    - duration: Time needed (e.g., "1-2 hours", "2-4 hours", "30 minutes")
    - bestTime: Best time of day (e.g., "Morning", "Afternoon", "Evening", "Anytime", "Golden Hour")
    
    Consider the weather conditions and suggest appropriate indoor/outdoor activities.
    For cold weather: suggest indoor activities, cozy places, winter sports
    For hot weather: suggest indoor activities, water activities, early morning/evening outdoor activities
    For rainy weather: suggest indoor activities, museums, cafes, covered areas
    For good weather: suggest outdoor activities, parks, hiking, photography
    
    Format your response as a JSON array of activities. Example:
    [
        {{
            "name": "Cozy Café Reading",
            "description": "Find a warm café and enjoy a book with hot chocolate",
            "category": "Leisure",
            "rating": 4.5,
            "duration": "1-3 hours",
            "bestTime": "Afternoon"
        }}
    ]
    
    IMPORTANT: Only return the JSON array, no other text."""),
    ("user", "Temperature: {temperature}°C, Weather: {weather}, Humidity: {humidity}%, Wind: {wind_speed} km/h in {city}")
])

chain = prompt | llm | output

def map_weather_condition(weather_description: str) -> str:
    """Map OpenWeatherMap description to frontend condition"""
    description_lower = weather_description.lower()
    
    if any(word in description_lower for word in ['clear', 'sunny']):
        return 'Sunny'
    elif any(word in description_lower for word in ['cloud', 'overcast']):
        return 'Cloudy'
    elif any(word in description_lower for word in ['rain', 'drizzle', 'shower']):
        return 'Rainy'
    elif any(word in description_lower for word in ['snow', 'sleet']):
        return 'Snowy'
    else:
        return 'Cloudy'  # Default fallback

def generate_weather_description(temperature: int, condition: str) -> str:
    """Generate a descriptive weather message"""
    if temperature < 10:
        if condition == 'Snowy':
            return "Bundle up! Perfect weather for winter activities"
        else:
            return "Chilly weather - great for cozy indoor activities"
    elif temperature < 20:
        return "Mild and comfortable weather for various activities"
    elif temperature < 30:
        return "Pleasant weather perfect for outdoor activities"
    else:
        return "Hot weather - stay cool and hydrated!"

def parse_activities_from_llm_response(llm_response: str) -> List[Dict[str, Any]]:
    """Parse activities from LLM response and handle potential formatting issues"""
    try:
        # Try to find JSON array in the response
        json_match = re.search(r'\[.*\]', llm_response, re.DOTALL)
        if json_match:
            json_str = json_match.group(0)
            activities_data = json.loads(json_str)
            
            # Validate and clean the data
            cleaned_activities = []
            for activity in activities_data:
                if isinstance(activity, dict) and all(key in activity for key in ['name', 'description', 'category', 'rating', 'duration', 'bestTime']):
                    # Ensure rating is a float
                    try:
                        activity['rating'] = float(activity['rating'])
                        if activity['rating'] < 4.0:
                            activity['rating'] = 4.0
                        elif activity['rating'] > 5.0:
                            activity['rating'] = 5.0
                    except:
                        activity['rating'] = 4.5
                    
                    cleaned_activities.append(activity)
            
            return cleaned_activities[:5]  # Limit to 5 activities
        
    except Exception as e:
        print(f"Error parsing LLM response: {e}")
    
    # Fallback activities if parsing fails
    return get_fallback_activities()

def get_fallback_activities() -> List[Dict[str, Any]]:
    """Provide fallback activities if LLM parsing fails"""
    return [
        {
            "name": "Local Exploration",
            "description": "Discover hidden gems and local attractions in your area",
            "category": "Adventure",
            "rating": 4.3,
            "duration": "2-4 hours",
            "bestTime": "Morning"
        },
        {
            "name": "Photography Walk",
            "description": "Capture beautiful moments and scenery around the city",
            "category": "Creative",
            "rating": 4.6,
            "duration": "1-2 hours",
            "bestTime": "Golden Hour"
        },
        {
            "name": "Café Hopping",
            "description": "Visit local coffee shops and enjoy warm beverages",
            "category": "Food & Drink",
            "rating": 4.4,
            "duration": "2-3 hours",
            "bestTime": "Afternoon"
        },
        {
            "name": "Cultural Visit",
            "description": "Explore museums, galleries, or cultural centers",
            "category": "Culture",
            "rating": 4.2,
            "duration": "2-3 hours",
            "bestTime": "Anytime"
        },
        {
            "name": "Relaxation Time",
            "description": "Find a peaceful spot to unwind and enjoy the weather",
            "category": "Leisure",
            "rating": 4.7,
            "duration": "1-2 hours",
            "bestTime": "Afternoon"
        }
    ]

@app.post("/weather", response_model=WeatherResponse)
async def get_weather(request: WeatherRequest):
    try:
        # Get weather data from OpenWeatherMap
        weather_url = f"https://api.openweathermap.org/data/2.5/weather?q={request.city}&appid={WEATHER_API_KEY}&units=metric"
        weather_response = requests.get(weather_url)
        
        if weather_response.status_code != 200:
            raise HTTPException(status_code=404, detail="City not found")
        
        weather_data = weather_response.json()
        
        # Extract weather information
        temperature = round(weather_data['main']['temp'])
        humidity = weather_data['main']['humidity']
        wind_speed = round(weather_data['wind']['speed'] * 3.6)  # Convert m/s to km/h
        visibility = round(weather_data.get('visibility', 10000) / 1000)  # Convert to km
        weather_condition = map_weather_condition(weather_data['weather'][0]['description'])
        description = generate_weather_description(temperature, weather_condition)
        
        # Get activity recommendations from LLM - Fixed variable names
        llm_response = chain.invoke({
            "temperature": temperature,
            "weather": weather_data['weather'][0]['description'],
            "humidity": humidity,
            "wind_speed": wind_speed,
            "city": request.city
        })
        
        
        # Parse activities from LLM response
        activities_data = parse_activities_from_llm_response(llm_response)
        
        # Create response structure matching frontend expectations
        weather_response_data = WeatherResponse(
            weather=WeatherData(
                city=request.city,
                temperature=temperature,
                condition=weather_condition,
                humidity=humidity,
                windSpeed=wind_speed,
                visibility=visibility,
                description=description
            ),
            activities=[Activity(**activity) for activity in activities_data]
        )
        
        return weather_response_data
        
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Weather API error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/")
async def root():
    return {"message": "Weather Activity Recommendation API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)