// On page load, call the functions
document.addEventListener("DOMContentLoaded", () => {
    populateTripData(); 
    destinationAutocomplete();
    attachHeroFormHandler();
   
});

// Load session data to auto-populate related trip data entered by user on homepage
function populateTripData() {
    const storedTrip = sessionStorage.getItem("tripData");
    if (!storedTrip) return;

    try {
        const trip = JSON.parse(storedTrip);

        const destInput = document.getElementById("destination");
        const startInput = document.getElementById("start-date");
        const endInput = document.getElementById("end-date");

        if (destInput && trip.destination) destInput.value = trip.destination;
        if (startInput && trip.startDate) startInput.value = trip.startDate;
        if (endInput && trip.endDate) endInput.value = trip.endDate;

    } catch (err) {
        console.warn("Failed to parse tripData:", err);
    }
}

// Autocomplete destination as user types using the Places API (New) dynamic loader by providing a dropdown list of option the user can choose from
async function destinationAutocomplete() {
    const input = document.getElementById("destination");
    if (!input) return;

    try {
        // Migration: Dynamically import the 'places' library
        const { Autocomplete } = await google.maps.importLibrary("places");

        // Migration: Use Field Masking to match New API standards and control costs
        const autocomplete = new Autocomplete(input, {
            types: ["(cities)"],
            fields: ["formattedAddress", "geometry", "displayName"]
        });

        autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();
            if (!place || !place.geometry) return;
            console.log("Selected place:", place.formatted_address);
        });
    } catch (error) {
        console.error("Error loading Google Maps Places library:", error);
    }
}

function attachHeroFormHandler() {
    const form = document.getElementById("hero-planner-form");
    if (!form) return;

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        // Get the hero-destination element by ID and store its value in the variable destination
        const destination = document.getElementById("destination").value.trim();

        // Get the start-date element by ID and store its value in the variable startDate
        const startDate = document.getElementById("start-date").value;

        // Get the end-date element by ID and store its value in the variable endDate
        const endDate = document.getElementById("end-date").value;

        // If destination, start date or end date fields are empty...
        if (!destination || !startDate || !endDate) {
            // Display alert directing user to fill out fields
            alert("Please fill out all fields.");
            return;
        }

        // If end date earlier before start date...
        if (new Date(endDate) < new Date(startDate)) {
            // Display alert directing user to put a valid end date
            alert("End date must be after start date.");
            return;
        }

        // Store trip data in the variable tripData
        const tripData = { 
            destination, 
            startDate, 
            endDate,
            timestamp: new Date().toLocaleString()
        };

        // Save the contents of the tripData variable to Session Storage as strings
        sessionStorage.setItem("tripData", JSON.stringify(tripData));

        const sessionUser = sessionStorage.getItem("currentUser");
        if (sessionUser) {
            // Get existing searches or initialize an empty array
            const recentSearches = JSON.parse(localStorage.getItem("recentSearches")) || [];
            
            // Add the new search to the beginning of the list
            recentSearches.unshift(tripData);

            // Keep only the last 5 searches to save space
            const limitedSearches = recentSearches.slice(0, 5);
            
            localStorage.setItem("recentSearches", JSON.stringify(limitedSearches));
        }

        // When user clicks start planning button, direct user to the planning page
        window.location.href = "planner.html";
    });
}