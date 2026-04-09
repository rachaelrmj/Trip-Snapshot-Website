// places.js
function initPlacesAutocomplete() {
    // IDs of destination input fields
    const destinationInputs = [
        document.getElementById("hero-destination"), // Homepage
        document.getElementById("destination")      // Planner page
    ];

    destinationInputs.forEach(input => {
        if (!input) return;

        const autocomplete = new google.maps.places.Autocomplete(input, {
            types: ["(cities)"],
            fields: ["formatted_address", "geometry"]
        });

        autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();
            if (!place || !place.geometry) return;

            input.value = place.formatted_address;

            // Trigger input event for storage.js
            input.dispatchEvent(new Event("input"));
        });
    });
}