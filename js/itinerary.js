document.addEventListener("DOMContentLoaded", () => {
    
    // Retrieve trip data from sessionStorage and store in the variable tripData
    const tripData = JSON.parse(sessionStorage.getItem("tripData"));

    // Safety check to prevent errors if tripData is not found
    if (!tripData) {
        // Log an error message to the console if trip data is not found in sessionStorage
        console.error("Trip data not found");
        return;
    }

    // Call the function to display the itinerary with the retrieved trip data
    displayOverview(tripData);

    // Call the function to display the trip data and preferences    
    displayItinerary(tripData);

    // Set up event listeners for itinerary action buttons (Homepage, Save, Clear, Edit Preferences)
    setupActionButtons();
});

// Function to show destination, dates, and selected preferences from sessionStorage
function displayOverview(data) {
    const overviewContainer = document.getElementById("itinerary-overview");
    if (!overviewContainer) return;

    // Format the preferences into a readable list
    const allPreferences = { ...data.activities, ...data.travelNeeds };
    const selectedPreferences = Object.keys(allPreferences)
        .filter(key => allPreferences[key] === true)
        .map(key => {
        // Convert camelCase to spaces (e.g., "rentalCar" -> "rental car")
        let formatted = key.replace(/([A-Z])/g, ' $1').trim().toLowerCase();
        // Capitalize the first letter (e.g., "rental car" -> "Rental car")
        return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    })
    .join(", ");

    overviewContainer.innerHTML = `
        <div class="trip-summary-card">
            <p><strong>Destination:</strong> ${data.destination}</p>
            <p><strong>Dates:</strong> ${data.startDate} to ${data.endDate}</p>
            <p><strong>Preferences:</strong> ${selectedPreferences || 'None selected'}</p>
        </div>
        <hr>
    `;
}

// Function to show the itinerary based on the provided trip data from sessionStorage
async function displayItinerary(data) {
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

    const { Place, SearchByTextRankPreference } = await google.maps.importLibrary("places");

    // Mapping of user preferences to Google Places types. Translating the user's selected preferences into the appropriate query for the Google Places API.
    const preferenceMapping = {
    'restaurant': { 
        label: 'Restaurants & Dining',
        query: 'Highly Rated Restaurants'
    },
    'shopping': { 
        label: 'Shopping & Malls',
        query: 'Popular Shopping Spots'
    },
    'attraction': { 
        label: 'Top Attractions', 
        query: 'Best Tourist Attractions' 
    },
    'nightlife': { 
        label: 'Nightlife', 
        query: 'Highly Rated Bars and Clubs' 
    },
    'hotel': { 
        label: 'Lodging & Accommodations', 
        query: 'Top Rated Hotels' 
    },
    'flight': { 
        label: 'Airport Information', 
        query: 'Nearest Airports' 
    },
    'rental-car': { 
        label: 'Rental Cars', 
        query: 'Nearest Rental Car Companies' 
    },
    'transportation': { 
        label: 'Transportation', 
        query: 'transportation' 
    }
};

    // Combine both activities and travelNeeds from planner.js object
    const travelPreferences = { ...data.activities, ...data.travelNeeds };

    for (const [preference, isSelected] of Object.entries(travelPreferences)) {
        if (isSelected && preferenceMapping[preference]) {

            // Create a container for each preference category selected by user within each day to hold both the header and the results
            const categorySection = document.createElement("div");
            categorySection.className = "category-group";
            
            // Add a sub-header for the category (e.g., "Restaurants & Dining")
            const categoryHeader = document.createElement("h4");
            categoryHeader.className = "category-title";
            categoryHeader.innerText = preferenceMapping[preference].label;
            categorySection.appendChild(categoryHeader);

            // Create a smaller grid specifically for the cards of this category
            const categoryGrid = document.createElement("div");
            categoryGrid.className = "itinerary-results"; 
            categorySection.appendChild(categoryGrid);

            const request = {
                textQuery: `${preferenceMapping[preference].query} in ${data.destination}`,
                fields: ['displayName', 'formattedAddress', 'rating', 'photos', 'editorialSummary', 'nationalPhoneNumber', 'userRatingCount', 'websiteURI'],
                maxResultCount: 20,
                rankPreference: SearchByTextRankPreference.RELEVANCE,
            };

            try {
                const { places } = await Place.searchByText(request);

                if (places && places.length > 0) {
                    // Sort places by rating (highest first)
                    const sortedPlaces = places.sort((a, b) => (b.rating || 0) - (a.rating || 0));

                    // Display 5 per row
                    const cardsPerSection = 5;
                    const startIndex = (dayNumber - 1) % Math.floor(sortedPlaces.length / cardsPerSection);
                    const daySelection = sortedPlaces.slice(startIndex * cardsPerSection, (startIndex * cardsPerSection) + cardsPerSection);

                    daySelection.forEach(place => {
                        const card = createResultCard(place);
                        // Append the card to the category-specific grid instead of the global day grid
                        categoryGrid.appendChild(card);
                    });

                    // Append the entire category group (Header + Grid) to the day's result container
                    grid.appendChild(categorySection);
                }
            } catch (e) {
                console.error(`Search failed for ${preference}:`, e);
            }
        }
    }
}

// Function to create a result card element for a given place
function createResultCard(place) {
    // Get the photo URL for the place if available, otherwise use a default placeholder image. This ensures that even if a place does not have photos, the card will still display an image
    const photoUrl = (place.photos && place.photos.length > 0) 
        ? place.photos[0].getURI({ maxWidth: 400, maxHeight: 300 }) 
        : 'images/default-placeholder.jpg';
    
    let photoSpread = '';
        if (place.photos && place.photos.length > 1) {
            // Map through all photos, skipping the first one if you don't want to repeat the main photo
            photoSpread = place.photos.slice(1).map(photo => {
                const url = photo.getURI({ maxWidth: 300, maxHeight: 200 });
                return `<img src="${url}" alt="${place.displayName} gallery photo" class="photoGallery">`;
            }).join('');
    }

    // Create a new div element to represent the result card and store it in the variable resultContainer
    const resultContainer = document.createElement("div");

    // Assign the class "result-card" to the resultContainer element for styling purposes
    resultContainer.className = "result-card";

    // Check if website exists, then create a clickable link or a 'Not Available' span
    const website = place.websiteURI 
    ? `<a href="${place.websiteURI}" target="_blank" rel="noopener" class="website-link">Visit Website</a>` 
    : `<span class="no-website">Website: Not Available</span>`;

    resultContainer.innerHTML = `
        <img src="${photoUrl}" alt="${place.displayName}" class="main-card-photo">
        <div class="card-content">
            <h3>${place.displayName}</h3>
            <p class="address">${place.formattedAddress}</p>
            <p class="phone">Contact: ${place.nationalPhoneNumber ? place.nationalPhoneNumber : 'Not Available'}</p>
            <p class="rating">Rating: ${place.rating ? place.rating + ' ⭐' + '(' + place.userRatingCount + ')' : 'No rating'}</p>
            <p class="website-container">${website}</p>
            <p class="summary">Description: ${place.editorialSummary ? place.editorialSummary : 'Not Available'}</p>
            <div class="photo-spread">
                ${photoSpread}
            </div>
            <   
        </div>
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
            // Check for an active user session
            const sessionUser = sessionStorage.getItem("currentUser");

            if (!sessionUser) {
                // Alert the user they must be logged in
                alert("You must be signed in to save itineraries.");

                // Redirect them to login
                window.location.href = "login.html";
                return;
            }

            // Retrieve the trip data from sessionStorage and store it in the variable tripData
            const tripData = sessionStorage.getItem("tripData");

            if (!tripData) {
                alert("No itinerary data found to save.");
                return;
            }

            // Update itineraries list in Local Storage
            const savedTrips = JSON.parse(localStorage.getItem("itineraries")) || [];

            // Add the current trip to the list
            savedTrips.push(JSON.parse(tripData));
            localStorage.setItem("itineraries", JSON.stringify(savedTrips));

            // Show an alert to the user confirming that the trip has been saved to their profile
            alert("Trip has been saved to your profile!");
        });
    }

    // Get the clear itinerary button element by its ID and store it in the variable clearBtn
    const clearBtn = document.getElementById("clear-itinerary-button");
    // Check if the clear button exists before adding an event listener to prevent errors if the button is not present on the page

    if (clearBtn) {
        // Add a click event listener to the clear button
        clearBtn.addEventListener("click", () => {
            const tripData = JSON.parse(sessionStorage.getItem("tripData"));
        const sessionUser = sessionStorage.getItem("currentUser");
        const savedTrips = JSON.parse(localStorage.getItem("itineraries")) || [];

        // Check if this specific trip is currently saved in the user's profile
        const isSaved = tripData && savedTrips.some(trip => 
            trip.destination === tripData.destination && 
            trip.startDate === tripData.startDate
        );

        if (isSaved && sessionUser) {
            // Case 1: Trip is saved to profile
            if (confirm("This trip is saved to your profile. Would you also like to delete it from your saved itineraries?")) {
                // Delete from profile (localStorage)
                const updatedTrips = savedTrips.filter(trip => 
                    !(trip.destination === tripData.destination && trip.startDate === tripData.startDate)
                );
                localStorage.setItem("itineraries", JSON.stringify(updatedTrips));
                
                // Clear from current session and redirect
                sessionStorage.removeItem("tripData");
                window.location.href = "planner.html";
            } else {
                // User said "No" to deleting from profile, but still clear the current view
                sessionStorage.removeItem("tripData");
                window.location.href = "planner.html";
            } 
        } else {
            // Show a confirmation dialog to the user to confirm that they want to clear the trip data
            if (confirm("Are you sure you want to clear this trip?")) {
                // Remove the trip data from sessionStorage to clear the current trip information
                sessionStorage.removeItem("tripData");
                // Redirect to planner page after clearing the trip data
                window.location.href = "planner.html";
            }
        }
    });
}

    // Get the edit preferences button element by its ID and store it in the variable editBtn
    const editBtn = document.getElementById("edit-trip-button");
    // Check if the edit preferences button exists before adding an event listener to prevent errors if the button is not present on the page
    if (editBtn) {
        // Add a click event listener to the edit preferences button
        editBtn.addEventListener("click", () => {
            // Redirect back to planner page with existing data
            window.location.href = "planner.html";
        });
    }

}