// On page load, call the functions
document.addEventListener("DOMContentLoaded", () => {
    // Check if a user is currently logged into this tab/session
    const sessionData = sessionStorage.getItem("currentUser");

    populateTripData();
    tripFormHandler();
    destinationAutocomplete();
    showExistingPreferences();
});

// Load session data to auto-populate related trip data entered by user on homepage
function populateTripData() {
    const storedTrip = sessionStorage.getItem("tripData");
    if (!storedTrip) return;

    try {
        const trip = JSON.parse(storedTrip);
        const destInput = document.getElementById("destination");
        const startInput = document.getElementById("start-date");
        const end_input = document.getElementById("end-date");

        if (destInput && trip.destination) destInput.value = trip.destination;
        if (startInput && trip.startDate) startInput.value = trip.startDate;
        if (end_input && trip.endDate) end_input.value = trip.endDate;
    } catch (err) {
        console.warn("Failed to parse tripData:", err);
    }
}

// Function to check boxes if user returns to edit preferences
function showExistingPreferences() {
    const storedTrip = sessionStorage.getItem("tripData");
    if (!storedTrip) return;

    try {
        const trip = JSON.parse(storedTrip);
        // Combine both activities and travelNeeds from the trip object
        const allSavedPreferences = { ...trip.activities, ...trip.travelNeeds };

        Object.keys(allSavedPreferences).forEach(preferenceKey => {
            const checkbox = document.getElementById(preferenceKey);
            if (checkbox && allSavedPreferences[preferenceKey] === true) {
                checkbox.checked = true;
            }
        });
    } catch (err) {
        console.warn("Failed to reload preferences:", err);
    }
}

let plannerPhotoUrl = ""; // Global variable for planner-specific photo capture

// Autocomplete destination as user types using the Places API (New)
async function destinationAutocomplete() {
    const input = document.getElementById("destination");
    if (!input) return;

    try {
        const { Autocomplete } = await google.maps.importLibrary("places");
        const autocomplete = new Autocomplete(input, {
            types: ["(cities)"],
            fields: ["geometry", "name", "photos"]
        });

        autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();
            if (place.photos && place.photos.length > 0) {
                // Update photo URL using getUrl from the New API
                plannerPhotoUrl = place.photos[0].getUrl({ maxWidth: 800, maxHeight: 600 });
            }
        });
    } catch (error) {
        console.error("Error loading Google Maps Places library:", error);
    }
}

function tripFormHandler() {
    const form = document.getElementById("trip-form");
    if (!form) return;

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        // Retrieve photo already stored in session to prevent loss during preference selection
        const existingData = JSON.parse(sessionStorage.getItem("tripData")) || {};

        const destination = document.getElementById("destination").value.trim();
        const startDate = document.getElementById("start-date").value;
        const endDate = document.getElementById("end-date").value;

        // Store user preferences
        const activities = {
            restaurant: document.getElementById("restaurant").checked,
            attraction: document.getElementById("attraction").checked,
            shopping: document.getElementById("shopping").checked,
            nightlife: document.getElementById("nightlife").checked
        };

        const travelNeeds = {
            airport: document.getElementById("airport").checked,
            hotel: document.getElementById("hotel").checked,
            rental: document.getElementById("rental").checked,
            transportation: document.getElementById("transportation").checked
        };

        // Form Validation
        if (!destination || !startDate || !endDate) {
            alert("Please fill out all fields.");
            return;
        }

        if (new Date(endDate) < new Date(startDate)) {
            alert("End date must be after start date.");
            return;
        }

        const hasActivity = Object.values(activities).some(val => val === true);
        const hasTravelNeed = Object.values(travelNeeds).some(val => val === true);

        if (!hasActivity && !hasTravelNeed) {
            alert("Please choose at least one preference so we can build your itinerary.");
            return;
        }

        // Store trip data and ensure photoUrl is merged correctly
        // We prioritize new selections, then existing session data, then null to avoid 404s
        const tripData = { 
            destination: destination, 
            startDate: startDate, 
            endDate: endDate,
            activities: activities,
            travelNeeds: travelNeeds,
            photoUrl: plannerPhotoUrl || existingData.photoUrl || null, 
            timestamp: new Date().toLocaleString()
        };

        sessionStorage.setItem("tripData", JSON.stringify(tripData));

        const sessionUser = sessionStorage.getItem("currentUser");
        if (sessionUser) {
            const recentSearches = JSON.parse(localStorage.getItem("recentSearches")) || [];
            recentSearches.unshift(tripData);
            const limitedSearches = recentSearches.slice(0, 5);
            localStorage.setItem("recentSearches", JSON.stringify(limitedSearches));
        }

        // Redirect to results page
        window.location.href = "results.html";
    });
}