async function fetchWeather(source,destination) {
    if (!source || !destination) {
        alert("Please select both source and destination.");
        return;
    }

    fetchWeatherInfo(destination);
}


async function fetchWeatherInfo(city) {
    

    console.log("Fetching Weather Data from:", url);  

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP Error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Weather API Response:", data);  

            if (!data.current) {
                throw new Error("Invalid API response. No 'current' weather data.");
            }

            document.getElementById("weather-info").innerHTML = `
                <p><strong>Humidity:</strong> ${data.current.humidity}%</p>
                <p><strong>Temperature:</strong> ${data.current.temperature} Degrees Celcius</p>
            `;
        })
        .catch(error => {
            console.error("Error fetching weather info:", error);
            document.getElementById("weather-info").innerText = `Error: ${error.message}`;
        });
        
    }
    async function fetchFlight(
        source, dest, budgets, currencys, travel_mode, prefs,
        children, adult, elderly, startdate, enddate
    ) {

        let cit = "BOM";
        let cities = "Mumbai";
        if (dest === "India") {
            cit = "BOM"; cities = "Mumbai";
        } else if (dest === "USA") {
            cit = "JFK"; cities="New York";
        } else if (dest === "Germany") {
            cit = "MUC"; cities = "Munich";
        } else if (dest === "Russia") {
            cit = "SVO"; cities = "Moscow";
        } else if (dest === "France") {
            cit = "CDG"; cities = "Paris";
        } else {
            cit = "FCO"; cities = "Rome";
        }
    
        let ori = "BOM";
        if (source === "India") {
            ori = "BOM";
        } else if (source === "USA") {
            ori = "JFK";
        } else if (source === "Germany") {
            ori = "MUC";
        } else if (source === "Russia") {
            ori = "SVO";
        } else if (source === "France") {
            ori = "CDG";
        } else {
            ori = "FCO";
        }
    
        const data = {
            country: dest,
            city: cities,
            preferences: prefs,
            budget: budgets,
            currency: currencys,
            origin: source,
            start_date: startdate,
            end_date: enddate,
            adults: adult,
            children: children,
            elderly: elderly,
            citi: cit,
            orig: ori
        };

        return fetch("http://127.0.0.1:5000/iterenary", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }
            return response.json();
        })
        .then(result => {
            console.log("Flight Offers:", result.flight_offers);
            document.getElementById("flight-info").innerHTML = `<pre>${result.flight_offers}</pre>`;

            console.log("Itinerary:", result.itinerary);
            const htmlitenary=marked.parse(result.itinerary);
            document.getElementById("itenary-info").innerHTML=htmlitenary;

            if (result.locations) {
                console.log("Locations:", result.locations);
                const locationSelect = document.getElementById("locationSelect");
                if (locationSelect) {
                    locationSelect.innerHTML = '<option value="">--Select a Location--</option>';

                    result.locations.forEach(loc => {
                        const option = document.createElement("option");
                        option.value = loc;
                        option.textContent = loc;
                        locationSelect.appendChild(option);
                    });
                }
            }
    
            return result;
        })
        .catch(error => {
            console.error("Fetch error:", error);
        });
      }
      const modeToggle = document.querySelector(".dark-mode-toggle");
    const body = document.body;
document.addEventListener("DOMContentLoaded", function() {
    if (localStorage.getItem("theme") === "dark") {
        body.classList.add("dark-mode");
        modeToggle.textContent = "☀️ Light Mode";
    }

    modeToggle.addEventListener("click", () => {
        body.classList.toggle("dark-mode");

        if (body.classList.contains("dark-mode")) {
            localStorage.setItem("theme", "dark");
            modeToggle.textContent = "☀️ Light Mode";
        } else {
            localStorage.setItem("theme", "light");
            modeToggle.textContent = "🌙 Dark Mode";
        }
    });
    function getFormDataFromStorage(){
        const storedData = localStorage.getItem("tripFormData");
        localStorage.removeItem("tripFormData");
        if (!storedData) {
          console.log("No form data found in localStorage.");
          return;
        }

        const formData = JSON.parse(storedData);
        console.log("Retrieved form data:", formData);
        // fetchWeather(formData.source, formData.dest);
        fetchFlight(
            formData.source,
            formData.dest,
            formData.budgets,
            formData.currencys,
            formData.travel_mode,
            formData.prefs,
            formData.children,
            formData.adult,
            formData.elderly,
            formData.startdate,
            formData.enddate
          );
        }
        getFormDataFromStorage();
      document.getElementById("locationSelect").addEventListener("change", function() {
        const selectedLocation = this.value;
        if (!selectedLocation) {

          document.getElementById("map").src = "";
          return;
        }
        document.getElementById("map").src = `https://www.google.com/maps?q=`+selectedLocation+`&output=embed&z=12`;});

        
    
});