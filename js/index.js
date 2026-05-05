// Wait until the DOM is fully loaded, then initialize page features
document.addEventListener("DOMContentLoaded", () => {
    populateTripData(); 
    destinationAutocomplete();
    attachHeroFormHandler();
});

// Load and display trip data saved in sessionStorage
function populateTripData() {
    // Retrieve trip data (stored as a JSON string)
    const storedTrip = sessionStorage.getItem("tripData");
    // If no trip data is stored, stop further code execution
    if (!storedTrip) return;

    // If there is trip data saved store to the storedTrip variable....
    try {
        // Convert JSON string into the JavaScript object trip 
        const trip = JSON.parse(storedTrip);

        // Get the destination HTML element from DOM and save as the destInput variable
        const destInput = document.getElementById("destination");
        // Get the start date HTML element from DOM and save as the startInput variable
        const startInput = document.getElementById("start-date");
        // Get the end date HTML element from DOM and save as the EndInput variable
        const endInput = document.getElementById("end-date");

         // Populate inputs only if both the element and data exist
        if (destInput && trip.destination) destInput.value = trip.destination;
        if (startInput && trip.startDate) startInput.value = trip.startDate;
        if (endInput && trip.endDate) endInput.value = trip.endDate;
    // Handle invalid JSON or parsing errors
    } catch (err) {
        console.warn("Failed to parse trip data:", err);
    }
}
// Holds the selected photo Url so it can be accessed and updated across multiple functions
let selectedPhotoUrl = ""; 

// Initialize destination autocomplete using Google Places API
async function destinationAutocomplete() {
    // Get the destination HTML element and store is value in the input variable
    const input = document.getElementById("destination");
    // If no data is stored in input variable, stop further code execution
    if (!input) return;

    try {
        // // Load the Places library dynamically
        const { Autocomplete } = await google.maps.importLibrary("places");

        const autocomplete = new Autocomplete(input, {
            types: ["(cities)"],
            // Request data from desired fields
            fields: ["formattedAddress", "geometry", "displayName", "photos"]
        });

        // Triggers when the user selects a place from suggestions (auto-populated drop-down)
        autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();
            if (!place || !place.geometry) return;

            // If photos are available and there is more than 1
            if (place.photos && place.photos.length > 0) {
                // Get first photo and store in the selectedPhotoUrl variable
                selectedPhotoUrl = place.photos[0].getURI({ 
                    // Set dimensions of photos
                    maxWidth: 800, 
                    maxHeight: 600 
                });
                
                // Immediately save photo to sessionStorage so it is not lost on when leaving page
                const currentData = JSON.parse(sessionStorage.getItem("tripData")) || {};
                currentData.photoUrl = selectedPhotoUrl;
                sessionStorage.setItem("tripData", JSON.stringify(currentData));
            }            
        });
        // Handle API loading errors
    } catch (error) {
        console.error("Error loading Google Maps Places library:", error);
    }
}


function attachHeroFormHandler() {
    const form = document.getElementById("hero-planner-form");
    if (!form) return;

    form.addEventListener("submit", (e) => {
        // Prevent default form behavior
        e.preventDefault();

        // Get user input values
        const destination = document.getElementById("destination").value.trim();
        const startDate = document.getElementById("start-date").value;
        const endDate = document.getElementById("end-date").value;

        // Ensure all fields are filled
        if (!destination || !startDate || !endDate) {
            alert("Please fill out all fields.");
            return;
        }

        // Ensure end date is after start date
        if (new Date(endDate) < new Date(startDate)) {
            alert("End date must be after start date.");
            return;
        }

        // Build trip data object to use across all pages
        const tripData = { 
            destination,
            startDate,
            endDate,
            // Prefer newly selected photo, otherwise reuse existing one
            photoUrl: selectedPhotoUrl || existingData.photoUrl || "",
            timestamp: new Date().toLocaleString()
        };

        // Save to Session Storage
        sessionStorage.setItem("tripData", JSON.stringify(tripData));

        const sessionUser = sessionStorage.getItem("currentUser");
        if (sessionUser) {
             // Store recent searches (limit to 5)
            const recentSearches = JSON.parse(localStorage.getItem("recentSearches")) || [];
            recentSearches.unshift(tripData);
            const limitedSearches = recentSearches.slice(0, 5);
            localStorage.setItem("recentSearches", JSON.stringify(limitedSearches));
        }

        // Redirect to the planning page
        window.location.href = "planner.html";
    });
}