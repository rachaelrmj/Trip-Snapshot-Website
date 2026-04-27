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

let selectedPhotoUrl = ""; // Global variable to store the image URL

// Autocomplete destination as user types using the Places API (New) dynamic loader
async function destinationAutocomplete() {
    const input = document.getElementById("destination");
    if (!input) return;

    try {
        // Dynamically import the 'places' library
        const { Autocomplete } = await google.maps.importLibrary("places");

        const autocomplete = new Autocomplete(input, {
            types: ["(cities)"],
            // Ensure photos is included in fields to satisfy API (New) requirements
            fields: ["formattedAddress", "geometry", "displayName", "photos"]
        });

        autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();
            if (!place || !place.geometry) return;

            // Get the URI for the first photo available for the city
            if (place.photos && place.photos.length > 0) {
                // Use getURI to get a valid string URL based on Google Places API (New)
                // We request a larger width to ensure the API serves a high-quality crop
                selectedPhotoUrl = place.photos[0].getURI({ maxWidth: 800, maxHeight: 600 });
                
                // STASH: Immediately save to session so it is not lost on page redirect
                const currentData = JSON.parse(sessionStorage.getItem("tripData")) || {};
                currentData.photoUrl = selectedPhotoUrl;
                sessionStorage.setItem("tripData", JSON.stringify(currentData));
            }            
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

        // Get values from the hero form
        const destination = document.getElementById("destination").value.trim();
        const startDate = document.getElementById("start-date").value;
        const endDate = document.getElementById("end-date").value;

        // Validation for empty fields
        if (!destination || !startDate || !endDate) {
            alert("Please fill out all fields.");
            return;
        }

        // Validation for date logic
        if (new Date(endDate) < new Date(startDate)) {
            alert("End date must be after start date.");
            return;
        }

        // Store trip data in the variable tripData
        const tripData = { 
            destination: destination, 
            startDate: startDate, 
            endDate: endDate,
            // Capture URL from global or fall back to session stash
            photoUrl: selectedPhotoUrl || JSON.parse(sessionStorage.getItem("tripData"))?.photoUrl || "", 
            timestamp: new Date().toLocaleString()
        };

        // Save to Session Storage
        sessionStorage.setItem("tripData", JSON.stringify(tripData));

        const sessionUser = sessionStorage.getItem("currentUser");
        if (sessionUser) {
            // Log this search into Local Storage for the profile page
            const recentSearches = JSON.parse(localStorage.getItem("recentSearches")) || [];
            recentSearches.unshift(tripData);
            const limitedSearches = recentSearches.slice(0, 5);
            localStorage.setItem("recentSearches", JSON.stringify(limitedSearches));
        }

        // Redirect to the planning page
        window.location.href = "planner.html";
    });
}