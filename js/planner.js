// On page load, call the function
document.addEventListener("DOMContentLoaded", () => {
    populateTripData();
    attachPlannerFormHandler();
    destinationAutocomplete();
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

// Autocomplete destination as user types, provide a dropdown list of option the user can choose from
function destinationAutocomplete() {
    // prevent crash if Google hasn't loaded yet
    if (!window.google || !google.maps || !google.maps.places) {
        console.warn("Google Maps not loaded yet");
        return;
    }

    const input = document.getElementById("destination");
    if (!input) return;

    const autocomplete = new google.maps.places.Autocomplete(input, {
        types: ["geocode"],
        fields: ["formatted_address", "geometry", "name"]
    });

    autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();

        if (!place || !place.geometry) return;

        console.log("Selected place:", place.formatted_address);
    });
}

function attachPlannerFormHandler() {
    const form = document.getElementById("trip-form");
    if (!form) return;

    form.addEventListener("submit", (e) => {
        // Prevent default form behavior
        e.preventDefault();

        // Get the destination element by ID and store its value in the variable destination
        const destination = document.getElementById("destination").value.trim();
        // // Get the start-date element by ID and store its value in the variable startDate
        const startDate = document.getElementById("start-date").value;
        // Get the end-date element by ID and store its value in the variable endDate
        const endDate = document.getElementById("end-date").value;

        // Store user preferences (Activities) in the variable activities
        const activities = {
            restaurant: document.getElementById("restaurant").checked,
            attraction: document.getElementById("attraction").checked,
            shopping: document.getElementById("shopping").checked,
            nightLife: document.getElementById("night-life").checked
        };

        // Store user preferences (Travel Needs) in the variable travelNeeds
        const travelNeeds = {
            flight: document.getElementById("flight").checked,
            hotel: document.getElementById("hotel").checked,
            rentalCar: document.getElementById("rental-car").checked,
            transportation: document.getElementById("transportation").checked
        };

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

        // Store trip data and user preferences in the variable tripData
        const tripData = { 
            destination, 
            startDate, 
            endDate,
            activities: activities,
            travelNeeds: travelNeeds
        };

        // Save the contents of the tripData variable to Session Storage as strings
        sessionStorage.setItem("tripData", JSON.stringify(tripData));

        // When user clicks generate trip button, direct user to the itinerary page to see results
        window.location.href = "itinerary.html";
    });
}