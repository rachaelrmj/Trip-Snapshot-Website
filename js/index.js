// On page load, call the functions
document.addEventListener("DOMContentLoaded", () => {
    populateTripData();
    attachHeroFormHandler();
    initAutocomplete();
});

// Load session data to auto-populate related trip data entered by user on homepage
function populateTripData() {
    const storedTrip = sessionStorage.getItem("tripData");
    if (!storedTrip) return;

    try {
        const trip = JSON.parse(storedTrip);

        const destInput = document.getElementById("hero-destination");
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
function initAutocomplete() {
    if (!window.google || !google.maps) {
        console.warn("Google Maps not loaded");
        return;
    }

    const input = document.getElementById("hero-destination");
    if (!input) return;

    const autocomplete = new google.maps.places.Autocomplete(input, {
        types: ["(cities)"]
    });

    autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();

        if (!place || !place.geometry) return;

        console.log("Selected destination:", place.formatted_address);
    });
}

function attachHeroFormHandler() {
    const form = document.getElementById("hero-planner-form");
    if (!form) return;

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const destination = document.getElementById("hero-destination").value.trim();
        const startDate = document.getElementById("start-date").value;
        const endDate = document.getElementById("end-date").value;

        // Validation
        if (!destination || !startDate || !endDate) {
            alert("Please fill out all fields.");
            return;
        }

        if (new Date(endDate) < new Date(startDate)) {
            alert("End date must be after start date.");
            return;
        }

        const tripData = { destination, startDate, endDate };

        sessionStorage.setItem("tripData", JSON.stringify(tripData));

        window.location.href = "planner.html";
    });
}