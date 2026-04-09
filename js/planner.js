document.addEventListener("DOMContentLoaded", function() {

    const storedTrip = sessionStorage.getItem("tripData");

    if (!storedTrip) return;

    const trip = JSON.parse(storedTrip);

    const destinationField = document.getElementById("destination");
    const startDateField = document.getElementById("start-date");
    const endDateField = document.getElementById("end-date");

    if (destinationField) destinationField.value = trip.destination;
    if (startDateField) startDateField.value = trip.startDate;
    if (endDateField) endDateField.value = trip.endDate;

});