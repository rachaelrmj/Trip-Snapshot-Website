// Monitor planner form fields and persist changes as a draft
function setupPlannerFieldUpdates() {
    // Get HTML elements from DOM and store in variables
    const destination = document.getElementById("destination");
    const start = document.getElementById("start-date");
    const end = document.getElementById("end-date");

    // Get all preference checkboxes (activities + travel needs)
    const checkboxes = document.querySelectorAll('.preferences-section input[type="checkbox"]');

    // Exit if required field is missing 
    if (!destination) return;

    // Build and save updated trip data whenever a field changes
    function updateTripData() {
        const checked = Array.from(checkboxes).filter(i => i.checked);

        const draftData = {
            destination: destination.value,
            startDate: start?.value || "",
            endDate: end?.value || "",

            activities: checked
                .filter(i => i.closest('#activities'))
                .map(i => i.id),

            travelNeeds: checked
                .filter(i => i.closest('#travel-needs'))
                .map(i => i.id)
        };

        // Save draft separately to avoid overwriting finalized trip data
        localStorage.setItem("tripDraft", JSON.stringify(draftData));

        // Update trip summary to reflect latest user updates
        displayTripSummary();
    }

    // Update draft as user types destination
    destination.addEventListener("input", updateTripData);

    // Update draft when dates change
    [start, end].forEach(el => el?.addEventListener("change", updateTripData));

    // Update draft when preferences are toggled
    checkboxes.forEach(box => box.addEventListener("change", updateTripData));
}