// storage.js
document.addEventListener("DOMContentLoaded", () => {

    // -------------------------
    // HOMEPAGE: clear inputs & sessionStorage
    // -------------------------
    if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
        const heroDestination = document.getElementById("hero-destination");
        const heroStart = document.getElementById("start-date");
        const heroEnd = document.getElementById("end-date");

        if (heroDestination) heroDestination.value = "";
        if (heroStart) heroStart.value = "";
        if (heroEnd) heroEnd.value = "";

        sessionStorage.removeItem("tripData");

        // Homepage form submission
        const heroForm = document.getElementById("hero-planner-form");
        if (heroForm) {
            heroForm.addEventListener("submit", function (e) {
                e.preventDefault();

                const tripData = {
                    destination: heroDestination.value,
                    startDate: heroStart.value,
                    endDate: heroEnd.value
                };

                sessionStorage.setItem("tripData", JSON.stringify(tripData));
                window.location.href = "planner.html";
            });
        }
    }

    // -------------------------
    // PLANNER PAGE: Banner + input syncing
    // -------------------------
    const summaryBar = document.getElementById("trip-summary-bar");
    const summaryText = document.getElementById("trip-summary-text");

    const destinationField = document.getElementById("destination");
    const startDateField = document.getElementById("start-date");
    const endDateField = document.getElementById("end-date");

    // Hide banner initially
    if (summaryBar) summaryBar.style.display = "none";

    // Function to update banner text
    function updateSummary(destination, startDate, endDate) {
    if (!summaryBar || !summaryText) return;

    if (!destination) {
        summaryBar.style.display = "none";
        return;
    }

    summaryBar.style.display = "block";

    let tripLengthText = "";
    if (startDate && endDate) {
        // Parse dates as local time to avoid 1-day shift
        const start = new Date(startDate + "T00:00");
        const end = new Date(endDate + "T00:00");

        const tripLength = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
        const dayLabel = tripLength === 1 ? "Day" : "Days";
        tripLengthText = ` • ${tripLength} ${dayLabel}`;

        const options = { month: "short", day: "numeric" };
        const startFormatted = start.toLocaleDateString("en-US", options);
        const endFormatted = end.toLocaleDateString("en-US", options);

        summaryText.textContent = `${destination} • ${startFormatted} – ${endFormatted}${tripLengthText}`;
    } else {
        summaryText.textContent = `${destination}${tripLengthText}`;
    }
}

    // Initialize planner page from sessionStorage if exists
    const storedTrip = sessionStorage.getItem("tripData");
    if (storedTrip) {
        const trip = JSON.parse(storedTrip);

        if (destinationField) destinationField.value = trip.destination || "";
        if (startDateField) startDateField.value = trip.startDate || "";
        if (endDateField) endDateField.value = trip.endDate || "";

        updateSummary(trip.destination, trip.startDate, trip.endDate);
    }

    // Add input listeners for live updates
    if (destinationField) {
        destinationField.addEventListener("input", () => {
            updateSummary(destinationField.value, startDateField.value, endDateField.value);
            saveToSession();
        });
    }
    if (startDateField) {
        startDateField.addEventListener("input", () => {
            updateSummary(destinationField.value, startDateField.value, endDateField.value);
            saveToSession();
        });
    }
    if (endDateField) {
        endDateField.addEventListener("input", () => {
            updateSummary(destinationField.value, startDateField.value, endDateField.value);
            saveToSession();
        });
    }

    // Save planner inputs to sessionStorage whenever changed
    function saveToSession() {
        if (!destinationField) return;
        const tripData = {
            destination: destinationField.value,
            startDate: startDateField ? startDateField.value : "",
            endDate: endDateField ? endDateField.value : ""
        };
        sessionStorage.setItem("tripData", JSON.stringify(tripData));
    }

});