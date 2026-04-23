document.addEventListener("DOMContentLoaded", () => {
    
    // Retrieve trip data from sessionStorage and store in the variable tripData
    const tripData = JSON.parse(sessionStorage.getItem("tripData"));

    // Safety check to prevent errors if tripData is not found
    if (!tripData) {
        // Log an error message to the console if trip data is not found in sessionStorage
        console.error("Trip data not found");
        
        return;
    }
    // Call the function to render the itinerary with the retrieved trip data
    renderItinerary(tripData);

    // Set up event listeners for itinerary action buttons (Homepage, Save, Clear, Edit Preferences)
    setupActionButtons();
});

// Function to render the itinerary based on the provided trip data from sessionStorage
async function renderItinerary(data) {
    // Get the container element where the itinerary will be rendered and store it in the variable container
    const container = document.getElementById("itinerary-container");
    // Calculate the total number of days for the trip using the start and end dates from the trip data
    const start = new Date(data.startDate + 'T00:00:00');
    const end = new Date(data.endDate + 'T00:00:00');
    // Calculate the difference in time between the end and start dates
    const diffTime = end - start;
    // Convert the time difference from milliseconds to days and add 1 to include both start and end dates
    const totalDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
    // Clear container before rendering new itinerary to prevent duplication if the script is slow
    container.innerHTML = "";
    // Loop through each day of the trip
    for (let i = 1; i <= totalDays; i++) {
        // Create a new section element for each day and store it in the variable daySection
        const daySection = document.createElement("section"); 
        // Assign the class "itinerary-day" to the daySection element for styling purposes
        daySection.className = "itinerary-day"; 

        // Set the inner HTML of the daySection to include a heading with the day number and a div with a unique ID for displaying the results for that day. The ID is dynamically generated using the current day number (i) to ensure that each day's results are displayed in the correct section.
        daySection.innerHTML = `
            <h2>Day ${i}</h2>
            <div class="itinerary-results" id="day-${i}-results"></div>
        `;

        // Append the daySection to the main container element to display it on the page
        container.appendChild(daySection);

        // Call the function to populate the results for the current day, passing the day number and trip data as arguments. This function will handle fetching and displaying the relevant places based on the user's preferences.
        await populateDayResults(i, data);
    }
}

// Function to populate the results for a specific day based on the user's preferences and the trip data
async function populateDayResults(dayNumber, data) {
    // Get the grid container element for the current day using its dynamically generated ID and store it in the variable grid
    const grid = document.getElementById(`day-${dayNumber}-results`);
    
    // Check if the Google Maps API is loaded before attempting to use it
    if (typeof google === 'undefined') {
        // Log an error message to the console if the Google Maps API is not loaded
        console.error("Google Maps API not loaded");
        // Exit the function early to prevent further errors since the API is required for fetching place data
        return;
    }

    
    const service = new google.maps.places.PlacesService(document.createElement('div'));

    // Mapping of user preferences to Google Places types. Translating the user's selected preferences into the appropriate query for the Google Places API.
    const preferenceMapping = {
        // Map the activity and need preferences to Google Places types
        'restaurant': 'restaurant OR bar OR bakery OR brewery OR cafe OR deli',
        'nightLife': 'hookah_bar OR ',
        'attraction': 'tourist_attraction',
        'shopping': 'shopping_mall OR store',
        'hotel': 'lodging',
        'flight': 'airport',
        'rentalCar': 'car_rental',
        'transportation': 'bus_station OR bus_stop OR light_rail_station OR subway_station OR taxi_service OR train_station OR transit_station OR transportation_service'
    };

    // Combine both activities and travelNeeds from planner.js object
    const travelPreferences = { ...data.activities, ...data.travelNeeds };

    for (const [preference, isSelected] of Object.entries(travelPreferences)) {
        if (isSelected && preferenceMapping[preference]) {
            const request = {
                query: `${preferenceMapping[preference]} in ${data.destination}`,
                fields: ['name', 'photos', 'rating']
            };

            service.textSearch(request, (results, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    // Take 3 results per preference as requested
                    results.slice(0, 4).forEach(place => {
                        const card = createResultCard(place);
                        grid.appendChild(card);
                    });
                }
            });
        }
    }
}

// Function to create a result card element for a given place
function createResultCard(place) {

    // Get the photo URL for the place if available, otherwise use a default placeholder image. This ensures that even if a place does not have photos, the card will still display an image
    const photoUrl = place.photos ? place.photos[0].getUrl({ maxWidth: 400, maxHeight: 300 }) : 'images/default-placeholder.jpg';
    
    // Create a new div element to represent the result card and store it in the variable resultContainer
    const resultContainer = document.createElement("div");

    // Assign the class "result-card" to the resultContainer element for styling purposes
    resultContainer.className = "result-card";

    resultContainer.innerHTML = `
        <img src="${photoUrl}" alt="${place.name}">
        <h3>${place.name}</h3>
        <p>Rating: ${place.rating || 'N/A'} ⭐</p>
        <p>Description: ${place.types ? place.types.join(', ') : 'No description available'}</p>
    `;
    return resultContainer;
}

function setupActionButtons() {
    // Get the homepage button element by its ID and store it in the variable homeBtn
    const homeBtn = document.getElementById("homepage-button");
    // Check if the homepage button exists before adding an event listener to prevent errors if the button is not present on the page
    if (homeBtn) {
        // Add a click event listener to the homepage button
        homeBtn.addEventListener("click", () => {
            // Redirect to homepage when the button is clicked
            window.location.href = "index.html";
        });
    }

    // Get the save itinerary button element by its ID and store it in the variable saveBtn
    const saveBtn = document.getElementById("save-itinerary-button");
    // Check if the save button exists before adding an event listener to prevent errors if the button is not present on the page
    if (saveBtn) {
        // Add a click event listener to the save button
        saveBtn.addEventListener("click", () => {
            // Retrieve the trip data from sessionStorage and store it in the variable tripData
            const tripData = sessionStorage.getItem("tripData");

            // Save the trip data to localStorage under the key "savedTrip"
            localStorage.setItem("savedTrip", tripData);

            // Show an alert to the user confirming that the trip has been saved to their profile
            alert("Trip saved to your profile!");
        });
    }

    // Get the clear itinerary button element by its ID and store it in the variable clearBtn
    const clearBtn = document.getElementById("clear-itinerary-button");
    // Check if the clear button exists before adding an event listener to prevent errors if the button is not present on the page
    if (clearBtn) {
        // Add a click event listener to the clear button
        clearBtn.addEventListener("click", () => {
            // Show a confirmation dialog to the user to confirm that they want to clear the trip data
            if (confirm("Are you sure you want to clear this trip?")) {
                // Remove the trip data from sessionStorage to clear the current trip information
                sessionStorage.removeItem("tripData");
                // Redirect to planner page after clearing the trip data
                window.location.href = "planner.html";
            }
        });
    }

    // Get the edit preferences button element by its ID and store it in the variable editBtn
    const editBtn = document.getElementById("edit-preferences-button");
    // Check if the edit preferences button exists before adding an event listener to prevent errors if the button is not present on the page
    if (editBtn) {
        // Add a click event listener to the edit preferences button
        editBtn.addEventListener("click", () => {
            // Redirect back to planner page with existing data
            window.location.href = "planner.html";
        });
    }

}