function setupPlannerFieldUpdates() {
    const destination = document.getElementById("destination");
    const start = document.getElementById("start-date");
    const end = document.getElementById("end-date");
    const checkboxes = document.querySelectorAll('.preferences-section input[type="checkbox"]');

    if (!destination) return;

    function updateTripData() {
        const draftData = {
            destination: destination.value,
            startDate: start?.value || "",
            endDate: end?.value || "",
            // Filter checkboxes correctly based on container parent
            activities: Array.from(checkboxes).filter(i => i.checked && i.closest('#activities')).map(i => i.id),
            travelNeeds: Array.from(checkboxes).filter(i => i.checked && i.closest('#travel-needs')).map(i => i.id)
        };
        // Rename key to avoid overwriting final results
        localStorage.setItem("tripDraft", JSON.stringify(draftData));
        displayTripSummary();
    }

    destination.addEventListener("input", updateTripData);
    [start, end].forEach(el => el?.addEventListener("change", updateTripData));
    checkboxes.forEach(box => box.addEventListener("change", updateTripData));
}

function displayTripSummary() {
    const banner = document.getElementById("trip-summary-bar");
    const summaryText = document.getElementById("trip-summary-text");
    const data = localStorage.getItem("tripDraft"); // Look for draft
    
    if (!banner || !summaryText || !data) return;

    const trip = JSON.parse(data);
    if (!trip.destination) { banner.style.display = "none"; return; }

    banner.style.display = "block";
    summaryText.textContent = trip.destination + (trip.startDate ? ` • ${trip.startDate}` : "");
}