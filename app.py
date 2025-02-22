from flask import Flask, request, jsonify
from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()
app = Flask(__name__)

OPENAI_API_KEY = os.getenv("OPEN_AI_KEY")
client = OpenAI(api_key=OPENAI_API_KEY)
def generate_itenary(country, city, preferences, budget, currency, origin, start_date, end_date):
    prompt = f"""
    Create a detailed travel itinerary for a trip:
    - Destination: {city}, {country}
    - Budget: {budget} {currency}
    - Origin: {origin}
    - Dates: {start_date} to {end_date}
    - Preferences: {preferences}
    
    Include recommended activities, restaurants, and timings.
    Format it in a markdown table
    """
    
    response = response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a travel itenary planner. Do not Stray Off Topic"},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=150
            )
    
    return response["choices"][0]["message"]["content"]

@app.route('/itenary', methods=['POST'])
def itenary():
    data = request.get_json()
    
    country = data.get("country")
    city = data.get("city")
    preferences = data.get("preferences", "No specific preference")
    budget = data.get("budget")
    currency = data.get("currency", "USD")
    origin = data.get("origin")
    start_date = data.get("start_date")
    end_date = data.get("end_date")

    if not (country and city and budget and origin and start_date and end_date):
        return jsonify({"error": "Missing data"}), 400

    itinerary = generate_itenary(country, city, preferences, budget, currency, origin, start_date, end_date)
    
    return jsonify({"itinerary": itinerary})

if __name__ == '__main__':
    app.run(debug=True)
