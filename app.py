from flask import Flask, request, jsonify, render_template
import requests
import os
import re
from dotenv import load_dotenv
from openai import OpenAI
from flask_cors import CORS

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, allow_headers=["Content-Type"], methods=["GET", "POST"])


OPENAI_API_KEY = os.getenv("OPEN_AI_KEY")
client = OpenAI(api_key=OPENAI_API_KEY)


AMADEUS_API_KEY = os.getenv("AMADEUS_API_KEY")
AMADEUS_API_SECRET = os.getenv("AMADEUS_API_SECRET")
AM_TOKEN_URL = "https://test.api.amadeus.com/v1/security/oauth2/token"
AM_FLIGHT_OFFERS_URL = "https://test.api.amadeus.com/v2/shopping/flight-offers"

def get_amadeus_access_token():
    payload = {
        "grant_type": "client_credentials",
        "client_id": AMADEUS_API_KEY,
        "client_secret": AMADEUS_API_SECRET
    }
    response = requests.post(AM_TOKEN_URL, data=payload)
    token_data = response.json()
    return token_data.get("access_token")

def get_cheapest_flights(origin, destination, departure_date, return_date, adults, children):
    access_token = get_amadeus_access_token()
    headers = {"Authorization": f"Bearer {access_token}"}
    params = {
        "originLocationCode": origin,
        "destinationLocationCode": destination,
        "departureDate": departure_date,
        "returnDate": return_date,
        "adults": adults,
        "max": 1
    }
    if children:
        params["children"] = children
    response = requests.get(AM_FLIGHT_OFFERS_URL, headers=headers, params=params)
    return response.json()

def generate_itenary(country, city, preferences, budget, currency, origin, start_date, end_date, flight_info):
    prompt = f"""
    Create a detailed travel itinerary for a trip:
    - Destination: {city}, {country}
    - Budget: {budget} {currency}
    - Origin: {origin}
    - Dates: {start_date} to {end_date}
    - Preferences: {preferences}
    - Flight Info: {flight_info}
    Ensure top attractions for a location are always included.
    Consider the preferences while planning but do not make them take priority over best attractions.
    Include recommended activities, restaurants, and timings.
    It should include activities for each day from start date to end date.
    If origin and destination are in vastly different timezones, take it easy on the first day to overcome jetlag.
    Budget is given already taking flight cost into mind so you do not need to worry about flight cost.
    Format it in a markdown table with the following columns:
    |DAY|TIME|LOCATION|ACTIVITIES|
    where DAY is the day of the trip, LOCATION is a place within the destination city, TIME is time of day, and ACTIVITIES are the suggested activities.
    format of table is markdown table. markdown table should be able to be converted to html by marked.js this part is integral.Dont use special tags like ```markdown
    """
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "You are a travel itinerary planner. Do not stray off topic."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=1000
    )
    return response.choices[0].message.content

def extract_locations(itinerary: str, city: str):
    lines = itinerary.splitlines()
    itinerary_data = []
    current_day = None
    header_found = False  

    for line in lines:
        if line.strip().startswith("|"):
            if "DAY" in line and "LOCATION" in line:
                header_found = True
                continue
            if re.match(r'^\s*\|[-\s|]+\|$', line):
                continue
            if header_found:
                parts = line.split("|")
                if len(parts) >= 5:
                    day_cell = parts[1].strip()
                    if day_cell:
                        current_day = day_cell
                    location = parts[3].strip()
                    itinerary_data.append((current_day, location))

    day_locations = {}
    for day, loc in itinerary_data:
        if day not in day_locations:
            day_locations[day] = []
        if loc:
            day_locations[day].append(loc)

    sorted_days = sorted(day_locations.keys(), key=lambda d: int(d) if d.isdigit() else d)
    final_itinerary = []
    total_days = len(sorted_days)

    for index, day in enumerate(sorted_days):
        locs = day_locations[day]
        if index == 0:
            final_itinerary.extend(locs)
            final_itinerary.append("Hotel")
        elif index < total_days - 1:
            final_itinerary.extend(locs)
            final_itinerary.append("Hotel")
        else:
            final_itinerary.extend(locs)
            final_itinerary.append("Airport")

    final_itinerary = [
        f"{loc}, {city}"
        for loc in final_itinerary
        if loc not in ("Hotel", "Airport")
    ]

    return final_itinerary
def get_flight_details_string(flight_data):
    """
    Extract the total cost and flight segments (outbound and inbound)
    and return a more user-friendly, formatted string.
    """
    output_lines = []
    try:
        offer = flight_data['data'][0]

        total_cost = offer['price']['total']
        currency = offer['price']['currency']

        output_lines.append(f"Total Cost: {total_cost} {currency}\n")

        itineraries = offer['itineraries']

        if len(itineraries) >= 1:
            output_lines.append("Outbound Flight:")
            outbound_segments = itineraries[0]['segments']
            for idx, seg in enumerate(outbound_segments, start=1):
                dep = seg['departure']
                arr = seg['arrival']
                carrier = seg['carrierCode']
                flight_num = seg['number']
                dep_time = dep.get('at', 'N/A')
                arr_time = arr.get('at', 'N/A')

                segment_info = (
                    f"  {idx}) {carrier} {flight_num}\n"
                    f"     Departure: {dep['iataCode']} at {dep_time}\n"
                    f"     Arrival:   {arr['iataCode']} at {arr_time}\n"
                )
                output_lines.append(segment_info)

        if len(itineraries) >= 2:
            output_lines.append("Inbound Flight:")
            inbound_segments = itineraries[1]['segments']
            for idx, seg in enumerate(inbound_segments, start=1):
                dep = seg['departure']
                arr = seg['arrival']
                carrier = seg['carrierCode']
                flight_num = seg['number']
                dep_time = dep.get('at', 'N/A')
                arr_time = arr.get('at', 'N/A')

                segment_info = (
                    f"  {idx}) {carrier} {flight_num}\n"
                    f"     Departure: {dep['iataCode']} at {dep_time}\n"
                    f"     Arrival:   {arr['iataCode']} at {arr_time}\n"
                )
                output_lines.append(segment_info)

    except Exception as e:
        output_lines = [f"Error extracting flight details: {e}"]

    return "\n".join(output_lines)
@app.route('/')
def index():
    """
    Renders the main page of the application.
    """
    return render_template('index.html')

@app.route('/iterenary', methods=['POST'])
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
    adults = data.get("adults", 1)
    children = data.get("children", 0)
    elderly = data.get("elderly", 0)  
    source_airport=data.get("orig","BOM")
    dest_airport=data.get("citi","CDG")
    if not (country and city and budget and origin and start_date and end_date):
        return jsonify({"error": "Missing data"}), 400

    flight_data = get_cheapest_flights(source_airport, dest_airport, start_date, end_date, adults, children)

    print("Amadeus Flight Offers Response:", flight_data)
    flight_string = get_flight_details_string(flight_data)

    itinerary = generate_itenary(country, city, preferences, budget, currency, origin, start_date, end_date, flight_data)
    locations=extract_locations(itinerary,city)
    return jsonify({"flight_offers": flight_string,"itinerary": itinerary,"locations":locations})



if __name__ == '__main__':
    app.run(debug=True)
