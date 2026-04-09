// Trip Planner - Form Handling & API Integration
document.addEventListener("DOMContentLoaded", () => {
    // Get form element from the DOM
    const form = document.getElementById("trip-form");

    // Handle form submission
    form.addEventListener("submit", async (e) => {
        // Prevent form from submitting normally
        e.preventDefault();

        // Get form elements from the DOM
        const destination = document.getElementById("destination").value.trim();
        const startDate = document.getElementById("start-date").value;
        const endDate = document.getElementById("end-date").value;

        // Get selected activities
        const activities = getCheckedOptions([
            "adventure",
            "relaxation",
            "food",
            "nightlife",
            "family"
        ]);

        // Get selected travel needs
        const travelNeeds = getCheckedOptions([
            "flights",
            "hotels",
            "rental-cars"
        ]);
        
        // Input Validation
        if (!destination || !startDate || !endDate) {
            alert("Please fill in all required fields.");
            return;
        }
        // Validate date logic
        if (new Date(endDate) < new Date(startDate)) {
            alert("End date cannot be before start date.");
            return;
        }
        // Set variable to hold all form data
        const tripData = {
            destination,
            startDate,
            endDate,
            activities,
            travelNeeds
        };

        // Show loading indicator while fetching data and generating itinerary
        try {
            // Display loading message
            showLoading();

            // Fetch trip data from RapidAPI and build itinerary
            const trip = await fetchTripData(tripData);

            // Save trip data to localStorage for retrieval on itinerary page
            saveTrip(trip);

            // Redirect to itinerary page to display generated trip
            window.location.href = "itinerary.html";

        } catch (error) {
            // Log error to console and show message
            console.error("Trip generation failed:", error);
            alert("Unable to generate trip. Please try again.");
        } finally {
            // Hide loading indicator after process completes
            hideLoading();
        }
    });
});



// RapidAPI Integration
const API_KEY = "96eb20ff43mshe9b4602fb7fc643p18c53ejsn327773d3b3d0";
const API_HOST = "travel-advisor.p.rapidapi.com";

// Fetch trip data based on user input and build itinerary
async function fetchTripData(tripData) {
    const headers = {
        "X-RapidAPI-Key": API_KEY,
        "X-RapidAPI-Host": API_HOST
    };

    // Get Location ID for the destination
    const locationRes = await fetch(
        `https://${API_HOST}/locations/search?query=${encodeURIComponent(tripData.destination)}&limit=1`,
        { method: "GET", headers }
    );

    // Check if location search was successful
    if (!locationRes.ok) {
        throw new Error("Failed to fetch location data");
    }

    // Parse location response and extract location ID
    const locationJson = await locationRes.json();

    // Safely access location ID from the response
    const locationId = locationJson?.data?.[0]?.result_object?.location_id;

    // If location ID is not found, throw an error
    if (!locationId) {
        throw new Error("Destination not found");
    }

    // Fetch attractions for the location
    const attractionsRes = await fetch(
        `https://${API_HOST}/attractions/list?location_id=${locationId}&currency=USD&lang=en_US&lunit=km`,
        { method: "GET", headers }
    );

    // Check if attractions fetch was successful
    if (!attractionsRes.ok) {
        throw new Error("Failed to fetch attractions data");
    }

    // Parse attractions response and extract attractions list
    const attractionsJson = await attractionsRes.json();

    // Safely access attractions data from the response
    const attractions = attractionsJson?.data || [];

    // If user selected "food" activity, fetch restaurants for the location
    let restaurants = [];

    if (tripData.activities.includes("food")) {
        const foodRes = await fetch(
            `https://${API_HOST}/restaurants/list?location_id=${locationId}&currency=USD&lang=en_US`,
            { method: "GET", headers }
        );

        // Check if restaurants fetch was successful
        if (!foodRes.ok) {
            throw new Error("Failed to fetch restaurants data");
        }

        // Parse restaurants response and extract restaurants list
        const foodJson = await foodRes.json();

        // Safely access restaurants data from the response
        restaurants = foodJson?.data || [];
    }

    // Build and return the itinerary using the fetched data
    return buildItinerary(tripData, attractions, restaurants);
}

// Itinerary Builder
function buildItinerary(tripData, attractions, restaurants) {
    // Calculate the number of days for the trip based on start and end dates
    const days = getTripLength(tripData.startDate, tripData.endDate);

    // Filter out any attractions or restaurants that are missing essential information (name and address)
    const cleanAttractions = attractions.filter(p => p.name && p.address);
    const cleanRestaurants = restaurants.filter(p => p.name && p.address);

    // Initialize an empty itinerary array to hold the daily plans
    const itinerary = [];

    // Loop through each day of the trip and assign attractions and restaurants to create a daily plan
    for (let i = 0; i < days; i++) {
        // Initialize an array to hold the activities for the current day
        const dayPlan = [];

        // Add 2 attractions per day from the cleaned attractions list
        const dailyAttractions = cleanAttractions.slice(i * 2, i * 2 + 2);

        // Loop through the daily attractions and add them to the day's plan with relevant details
        dailyAttractions.forEach(place => {
            dayPlan.push({
                type: "attraction",
                name: place.name,
                address: place.address,
                rating: place.rating || "N/A"
            });
        });

        // === Add Restaurant if Food Selected ===
        if (tripData.activities.includes("food") && cleanRestaurants[i]) {
            const foodPlace = cleanRestaurants[i];

            dayPlan.push({
                type: "restaurant",
                name: foodPlace.name,
                address: foodPlace.address,
                rating: foodPlace.rating || "N/A"
            });
        }

        itinerary.push({
            day: i + 1,
            activities: dayPlan
        });
    }

    return {
        destination: tripData.destination,
        dates: `${tripData.startDate} to ${tripData.endDate}`,
        itinerary
    };
}

// Utilities


function getCheckedOptions(ids) {
    return ids.filter(id => {
        const el = document.getElementById(id);
        return el && el.checked;
    });
}

function getTripLength(start, end) {
    const diff = new Date(end) - new Date(start);
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
}


// ==============================
// Storage
// ==============================

function saveTrip(trip) {
    localStorage.setItem("tripData", JSON.stringify(trip));
}


// ==============================
// UI Helpers
// ==============================

function showLoading() {
    let loader = document.getElementById("loading");

    if (!loader) {
        loader = document.createElement("div");
        loader.id = "loading";
        loader.innerText = "Generating your trip...";
        loader.style.position = "fixed";
        loader.style.top = "0";
        loader.style.left = "0";
        loader.style.width = "100%";
        loader.style.height = "100%";
        loader.style.background = "rgba(0,0,0,0.6)";
        loader.style.color = "#fff";
        loader.style.display = "flex";
        loader.style.alignItems = "center";
        loader.style.justifyContent = "center";
        loader.style.fontSize = "1.5rem";
        loader.style.zIndex = "9999";

        document.body.appendChild(loader);
    }

    loader.style.display = "flex";
}

function hideLoading() {
    const loader = document.getElementById("loading");
    if (loader) loader.style.display = "none";
}

// ==============================
// Trip Snapshot - Display Itinerary
// ==============================

document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("itinerary-container");

    if (!container) return;

    const trip = getTrip();

    if (!trip) {
        container.innerHTML = `
            <div class="no-trip">
                <h2>No Trip Found</h2>
                <p>Please create a trip first.</p>
                <a href="planner.html" class="btn-primary">Plan a Trip</a>
            </div>
        `;
        return;
    }

    renderTrip(container, trip);
});


// ==============================
// Storage
// ==============================

function getTrip() {
    try {
        return JSON.parse(localStorage.getItem("tripData"));
    } catch {
        return null;
    }
}

// ==============================
// Render Full Trip
// ==============================

function renderTrip(container, trip) {
    container.innerHTML = "";

    // === Header Section ===
    const header = document.createElement("div");
    header.classList.add("trip-header");

    header.innerHTML = `
        <h2>${trip.destination}</h2>
        <p>${trip.dates}</p>
    `;

    container.appendChild(header);

    // === Itinerary Days ===
    const itineraryWrapper = document.createElement("div");
    itineraryWrapper.classList.add("itinerary-wrapper");

    trip.itinerary.forEach(day => {
        const dayCard = createDayCard(day);
        itineraryWrapper.appendChild(dayCard);
    });

    container.appendChild(itineraryWrapper);
}


// ==============================
// Create Day Card
// ==============================

function createDayCard(day) {
    const card = document.createElement("div");
    card.classList.add("day-card");

    const title = document.createElement("h3");
    title.textContent = `Day ${day.day}`;
    card.appendChild(title);

    if (!day.activities || day.activities.length === 0) {
        const empty = document.createElement("p");
        empty.textContent = "No activities planned.";
        card.appendChild(empty);
        return card;
    }

    const list = document.createElement("ul");

    day.activities.forEach(activity => {
        const item = document.createElement("li");

        item.innerHTML = `
            <strong>${activity.name}</strong><br>
            <span>${activity.address || ""}</span><br>
            <span>⭐ ${activity.rating || "N/A"}</span>
        `;

        list.appendChild(item);
    });

    card.appendChild(list);

    return card;
}