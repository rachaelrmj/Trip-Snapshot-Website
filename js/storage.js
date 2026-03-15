document.addEventListener("DOMContentLoaded", () => {

    saveHomepageTrip();
    populatePlannerFields();
    displayTripSummary();

});

function saveHomepageTrip() {

    const heroForm = document.getElementById("hero-planner-form");
    if (!heroForm) return;

    heroForm.addEventListener("submit", function (e) {

        e.preventDefault();

        const tripData = {
            destination: document.getElementById("hero-destination").value,
            startDate: document.getElementById("start-date").value,
            endDate: document.getElementById("end-date").value
        };

        sessionStorage.setItem("tripData", JSON.stringify(tripData));

        window.location.href = "planner.html";

    });

}

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

function displayTripSummary() {

    const storedTrip = sessionStorage.getItem("tripData");
    if (!storedTrip) return;

    const trip = JSON.parse(storedTrip);

    const summaryElement = document.getElementById("trip-summary-text");
    if (!summaryElement) return;

    const startParts = trip.startDate.split("-");
    const endParts = trip.endDate.split("-");

    const start = new Date(startParts[0], startParts[1] - 1, startParts[2]);
    const end = new Date(endParts[0], endParts[1] - 1, endParts[2]);

    const tripLength = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;

    const options = { month: "short", day: "numeric" };

    const startFormatted = start.toLocaleDateString("en-US", options);
    const endFormatted = end.toLocaleDateString("en-US", options);

    const dayLabel = tripLength === 1 ? "Day" : "Days";

    summaryElement.textContent = `${trip.destination} • ${startFormatted} – ${endFormatted} • ${tripLength} ${dayLabel}`;
}