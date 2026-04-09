/* ---------------- Recent Searches Storage ---------------- */
function saveRecentSearch(destination, start, end) {
    // Retrieve existing searches or start a new array
    let searches = JSON.parse(localStorage.getItem("recentSearches")) || [];

    // Create a search object
    const newSearch = {
        destination,
        dates: (start && end) ? `${start} to ${end}` : "Dates not set",
        timestamp: new Date().getTime()
    };

    // Prevent duplicates and keep only the 5 most recent
    searches = searches.filter(s => s.destination !== destination);
    searches.unshift(newSearch);
    if (searches.length > 5) searches.pop();

    localStorage.setItem("recentSearches", JSON.stringify(searches));
}

// Update existing saveHomepageTrip() in storage.js to call this:
function saveHomepageTrip() {
    const heroForm = document.getElementById("hero-planner-form");
    if (!heroForm) return;

    heroForm.addEventListener("submit", (e) => {
        const dest = document.getElementById("hero-destination").value;
        const start = document.getElementById("start-date").value;
        const end = document.getElementById("end-date").value;

        if (!dest) return;

        // NEW: Log this as a recent search
        saveRecentSearch(dest, start, end);
        
        sessionStorage.setItem("tripData", JSON.stringify({ destination: dest, startDate: start, endDate: end }));
    });
}

/* ---------------- Homepage & Planner Autocomplete ---------------- */
function setupAutocomplete() {
    if (typeof google === "undefined") return;

    const inputs = [
        document.getElementById("hero-destination"), // homepage
        document.getElementById("destination")      // planner page
    ];

    inputs.forEach(input => {
        if (!input) return;

        const autocomplete = new google.maps.places.Autocomplete(input, {
            types: ["(cities)"],
            fields: ["formatted_address", "geometry"]
        });

        autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();
            if (!place || !place.geometry) return;

            input.value = place.formatted_address;
            input.dispatchEvent(new Event("input"));
        });
    });
}

/* ---------------- Homepage Inputs ---------------- */
function clearHomepageInputs() {
    if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
        const heroDestination = document.getElementById("hero-destination");
        const heroStart = document.getElementById("start-date");
        const heroEnd = document.getElementById("end-date");

        if (heroDestination) heroDestination.value = "";
        if (heroStart) heroStart.value = "";
        if (heroEnd) heroEnd.value = "";
    }
}

/* ---------------- Save Homepage Form ---------------- */
function saveHomepageTrip() {
    const heroForm = document.getElementById("hero-planner-form");
    if (!heroForm) return;

    heroForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const tripData = {
            destination: document.getElementById("hero-destination").value,
            startDate: document.getElementById("start-date").value,
            endDate: document.getElementById("end-date").value
        };

        if (!tripData.destination) return;

        sessionStorage.setItem("tripData", JSON.stringify(tripData));
        window.location.href = "planner.html";
    });
}

/* ---------------- Populate Planner Fields ---------------- */
function populatePlannerFields() {
    const storedTrip = sessionStorage.getItem("tripData");
    if (!storedTrip) return;

    const trip = JSON.parse(storedTrip);

    const destinationField = document.getElementById("destination");
    const startDateField = document.getElementById("start-date");
    const endDateField = document.getElementById("end-date");

    if (destinationField) destinationField.value = trip.destination;
    if (startDateField) startDateField.value = trip.startDate;
    if (endDateField) endDateField.value = trip.endDate;
}

/* ---------------- Dynamic Updates on Planner Page ---------------- */
function setupPlannerFieldUpdates() {
    const destination = document.getElementById("destination");
    const start = document.getElementById("start-date");
    const end = document.getElementById("end-date");

    if (!destination) return;

    function updateTripData() {
        const tripData = {
            destination: destination.value,
            startDate: start ? start.value : "",
            endDate: end ? end.value : ""
        };

        if (!tripData.destination) return;

        sessionStorage.setItem("tripData", JSON.stringify(tripData));
        displayTripSummary();
    }

    destination.addEventListener("input", updateTripData);
    if (start) start.addEventListener("change", updateTripData);
    if (end) end.addEventListener("change", updateTripData);
}

/* ---------------- Display Trip Summary Banner ---------------- */
function displayTripSummary() {
    const banner = document.getElementById("trip-summary-bar");
    const summaryText = document.getElementById("trip-summary-text");

    if (!banner || !summaryText) return;

    const storedTrip = sessionStorage.getItem("tripData");
    if (!storedTrip) {
        banner.style.display = "none";
        return;
    }

    const trip = JSON.parse(storedTrip);
    if (!trip.destination) {
        banner.style.display = "none";
        return;
    }

    banner.style.display = "block";

    let summary = trip.destination;

    if (trip.startDate && trip.endDate) {

        function parseLocalDate(inputValue) {
            const [year, month, day] = inputValue.split("-").map(Number);
            return new Date(year, month - 1, day);
        }

        const start = parseLocalDate(trip.startDate);
        const end = parseLocalDate(trip.endDate);

        const tripLength = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;

        const options = { month: "short", day: "numeric" };
        const startFormatted = start.toLocaleDateString("en-US", options);
        const endFormatted = end.toLocaleDateString("en-US", options);
        const dayLabel = tripLength === 1 ? "Day" : "Days";

        summary += ` • ${startFormatted} – ${endFormatted} • ${tripLength} ${dayLabel}`;
    }

    summaryText.textContent = summary;
}

/* ---------------- Initialize DOM ---------------- */
document.addEventListener("DOMContentLoaded", () => {
    clearHomepageInputs();
    saveHomepageTrip();
    populatePlannerFields();
    setupPlannerFieldUpdates();
    displayTripSummary();
});