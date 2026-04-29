document.addEventListener("DOMContentLoaded", () => {
    // Retrieve trip data from sessionStorage and store in the variable tripData
    const tripData = JSON.parse(sessionStorage.getItem("tripData"));
    // Query the main element and save as mainContent
    const mainContent = document.querySelector("main"); 

    // If there is no tripData in sessionStorage...
    if (!tripData) {
        // Display message to user informing them they must plan a trip in order to see an itinerary
        if (mainContent) {
            mainContent.innerHTML = `
                <section id="empty-itinerary-message" style="padding: 100px 20px; text-align: center;">
                    <h2 style="font-size: 32px; margin-bottom: 20px;">No Itinerary Found</h2>
                    <p style="font-size: 18px; margin-bottom: 30px;">
                        You must plan a trip in order to see an itinerary.
                    </p>
                    <a href="planner.html" style="
                        background-color: #1ca7ec; 
                        color: white; 
                        padding: 15px 30px; 
                        border-radius: 50px; 
                        text-decoration: none; 
                        font-weight: bold;
                    ">Start Planning Now</a>
                </section>
            `;
        }
        // Log an error message to the console if trip data is not found in sessionStorage
        console.error("Trip data not found");
        // Stop further execution so Google Maps doesn't try to load
        return;
    }
    
    // Call the function to display the itinerary with the retrieved trip data
    displayOverview(tripData);

   // Call the function to display the trip data and preferences    
    displayItinerary(tripData);

    // Set up event listeners for itinerary action buttons
    setupActionButtons();
});

// Function to show destination, dates, and selected preferences from sessionStorage
function displayOverview(data) {
    // Get the itinerary-overview HTML element and store in the overviewContainer variable
    const overviewContainer = document.getElementById("itinerary-overview");
    // If no such element exists, exit function
    if (!overviewContainer) return;

    // Format the preferences into a readable list and store in the allPReferences variable
    const allPreferences = { ...data.activities, ...data.travelNeeds };
    // Gets all keys from allPreferences
    const selectedPreferences = Object.keys(allPreferences)
        // Filters the keys set to true
        .filter(key => allPreferences[key] === true)
        .map(key => {
        // Convert camelCase to spaces (e.g., "rentalCar" -> "rental car")
        let formatted = key.replace(/([A-Z])/g, ' $1').trim().toLowerCase();
        // Capitalize the first letter (e.g., "rental car" -> "Rental car")
        return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    })
    // Join keys into a comma-separated string
    .join(", ");

    // Display the following in the overviewContainer
    overviewContainer.innerHTML = `
        <h2>Your Itinerary</h2>
        <p>Here is your personalized itinerary based on your preferences and trip details.</p>
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
    const container = document.getElementById("itinerary-container");
    const savedItinerary = JSON.parse(sessionStorage.getItem("itinerary"));
    
    if (!savedItinerary) {
        container.innerHTML = "<p>No items added to your itinerary yet.</p>";
        return;
    }

    container.innerHTML = "";

    // Display Travel Needs
    if (savedItinerary.travelNeeds && savedItinerary.travelNeeds.length > 0) {
        const travelSection = document.createElement("section");
        travelSection.id = "travel-needs-section";
        travelSection.className = "itinerary-day";
        travelSection.innerHTML = `
            <h2 class="section-main-title">Travel Needs</h2>
            <div class="itinerary-results"></div> 
        `;
        const grid = travelSection.querySelector(".itinerary-results");
        savedItinerary.travelNeeds.forEach(item => {
            grid.appendChild(createSavedResultCard(item, 'travelNeeds'));
        });
        container.appendChild(travelSection);
    }

    // Container for all Daily Activities
    const activitiesContainer = document.createElement("section"); 
    activitiesContainer.id = "activities-container";
    activitiesContainer.innerHTML = `<h2 class="section-main-title">Daily Activities</h2>`;

    // Display Daily Activities
    Object.keys(savedItinerary).forEach(key => {
        if (key.startsWith("day") && savedItinerary[key].length > 0) {
            const dayNum = key.replace("day", "");
            const daySection = document.createElement("div");
            daySection.className = "itinerary-day";
            daySection.innerHTML = `
                <h3>Day ${dayNum}</h3>
                <div class="itinerary-results"></div>
            `;
            const grid = daySection.querySelector(".itinerary-results");
            savedItinerary[key].forEach(item => {
                grid.appendChild(createSavedResultCard(item, key));
            });
            activitiesContainer.appendChild(daySection);
        }
    });

    // 3. Append the activities block if it contains actual days
    if (activitiesContainer.children.length > 1) { 
        container.appendChild(activitiesContainer);
    }
}

function createSavedResultCard(item, dayKey) {
    const card = document.createElement("div");
    card.className = "result-card";
    card.innerHTML = `
        <div class="card-image-container">
            <img src="${item.photo}" alt="${item.name}">
            <button class="remove-button" aria-label="Remove item">x</button>
        </div>
        <div class="card-content">
            <h3>${item.name}</h3>
            <p class="address">${item.address}</p>
        </div>
    `;

    card.querySelector(".remove-button").addEventListener("click", () => {
        const saved = JSON.parse(sessionStorage.getItem("itinerary"));
        if (saved && saved[dayKey]) {
            // Filter out this specific item from the correct day or category
            saved[dayKey] = saved[dayKey].filter(i => i.name !== item.name);
            sessionStorage.setItem("itinerary", JSON.stringify(saved));
            window.location.reload(); 
        }
    });

    return card;
}

// Function to create a result card element for a given place
function createResultCard(place) {
    const photoUrl = (place.photos && place.photos.length > 0) 
        ? place.photos[0].getURI({ maxWidth: 400, maxHeight: 300 }) 
        : 'images/default-placeholder.jpg';
    
    const sessionUser = JSON.parse(sessionStorage.getItem("currentUser"));
    const tripData = JSON.parse(sessionStorage.getItem("tripData"));

    let isSaved = false;
    if (sessionUser) {
        const savedPlaces = JSON.parse(localStorage.getItem(`savedPlaces_${sessionUser.email}`)) || [];
        isSaved = savedPlaces.some(p => p.displayName === place.displayName);
    }

    let photoSpread = '';
    if (place.photos && place.photos.length > 1) {
        photoSpread = place.photos.slice(1, 4).map(photo => { 
            const url = photo.getURI({ maxWidth: 300, maxHeight: 200 });
            return `<img src="${url}" alt="${place.displayName} gallery photo" class="photoGallery">`;
        }).join('');
    }

    const resultContainer = document.createElement("div");
    resultContainer.className = `result-card ${isSaved ? 'saved' : ''}`;

    const website = place.websiteURI 
        ? `<a href="${place.websiteURI}" target="_blank" rel="noopener" class="website-link">Visit Website</a>` 
        : `<span class="no-website">Website: Not Available</span>`;

    const saveButtonHTML = sessionUser ? `
        <button class="save-button">
            ${isSaved ? '❤️' : '🤍'}
        </button>` : '';

    resultContainer.innerHTML = `
        <div class="card-image-container">
            <img src="${photoUrl}" alt="${place.displayName}" class="main-card-photo">
            ${saveButtonHTML}
        </div>

        <div class="card-content">
            <h3>${place.displayName}</h3>
            <p class="address">${place.formattedAddress}</p>
            <p class="phone">${place.nationalPhoneNumber ? place.nationalPhoneNumber : 'Not Available'}</p>
            <p class="rating">Rating: ${place.rating ? place.rating + ' ⭐' + '(' + place.userRatingCount + ')' : 'No rating'}</p>
            <p class="website-container">${website}</p>
            <p class="summary">Description: ${place.editorialSummary ? place.editorialSummary : 'Not Available'}</p>
            <div class="photo-spread">
                ${photoSpread}
            </div>
        </div>
    `;

    const button = resultContainer.querySelector(".save-button");
    if (button) {
        button.addEventListener("click", () => {
            const currentTrip = JSON.parse(sessionStorage.getItem("tripData"));
            const wasSaved = toggleSavePlace(
                place.displayName, 
                place.formattedAddress, 
                photoUrl, 
                place.websiteURI, 
                place.editorialSummary,
                currentTrip.destination
            );
            
            button.innerHTML = wasSaved ? '❤️' : '🤍';
            resultContainer.classList.toggle('saved', wasSaved);
        });
    }
    return resultContainer;
}

// Function to toggle saving a specific place to Local Storage
function toggleSavePlace(name, address, photo, website, summary, destination) {
    const sessionUser = JSON.parse(sessionStorage.getItem("currentUser"));
    
    if (!sessionUser) {
        alert("Sign up for an account to save your favorite places!");
        return false; 
    }

    const storageKey = `savedPlaces_${sessionUser.email}`;
    let savedPlaces = JSON.parse(localStorage.getItem(storageKey)) || [];

    const index = savedPlaces.findIndex(p => p.displayName === name);

    if (index > -1) {
        savedPlaces.splice(index, 1);
        localStorage.setItem(storageKey, JSON.stringify(savedPlaces));
        return false; // Not saved
    } else {
        savedPlaces.push({
            displayName: name,
            formattedAddress: address,
            photoUrl: photo,
            websiteURI: website,
            summary: summary,
            destination: destination,
            savedAt: new Date().toISOString()
        });
        localStorage.setItem(storageKey, JSON.stringify(savedPlaces));
        return true; 
    }
}

function setupActionButtons() {

    const homeButton = document.getElementById("homepage-button");
    if (homeButton) {
        homeButton.addEventListener("click", () => {
            window.location.href = "index.html";
        });
    }

    // Store the save button HTML element into the saveButton variable
    const saveButton = document.getElementById("save-itinerary-button");
    // If the save button is clicked...
    if (saveButton) {
        saveButton.addEventListener("click", () => {
            // Check if user is logged in via sessionStorage
            const sessionUser = JSON.parse(sessionStorage.getItem("currentUser"));
            
            // if no user is logged in...
            if (!sessionUser) {
                // Display message informing user they need to be signed in to save itineraries
                alert("You must be signed in to save itineraries.");
                // Then redirect to login
                window.location.href = "login.html"; 
                return;
            }

            // Get tripData from sessionStorage and store in the tripData variable
            const tripData = JSON.parse(sessionStorage.getItem("tripData"));
            // Get the itinerary
            const itinerary = JSON.parse(sessionStorage.getItem("itinerary"));

            if (!tripData || !itinerary) {
                alert("No itinerary data found to save.");
                return;
            }

            // 3. Combine data for a full profile save
            const fullItinerary = {
                ...tripData,
                details: itinerary,
                savedAt: new Date().toLocaleString()
            };

            // 4. Save to the specific user's itinerary collection in localStorage
            const storageKey = `savedItineraries_${sessionUser.email}`;
            const userSavedTrips = JSON.parse(localStorage.getItem(storageKey)) || [];
            
            // Prevent duplicate saves for the same destination and start date
            const isDuplicate = userSavedTrips.some(t => 
                t.destination === fullItinerary.destination && 
                t.startDate === fullItinerary.startDate
            );

            if (!isDuplicate) {
                userSavedTrips.push(fullItinerary);
                localStorage.setItem(storageKey, JSON.stringify(userSavedTrips));
                alert("This itinerary has been saved to your profile!");
            } else {
                alert("This trip is already saved in your profile.");
            }
        });
    }

    const clearButton = document.getElementById("clear-itinerary-button");

    if (clearButton) {
        clearButton.addEventListener("click", () => {

            const tripData = JSON.parse(sessionStorage.getItem("tripData"));
            const sessionUser = JSON.parse(sessionStorage.getItem("currentUser"));

            const savedTrips = JSON.parse(localStorage.getItem("itineraries")) || [];

            const isSaved = tripData && savedTrips.some(trip => 
                trip.destination === tripData.destination && 
                trip.startDate === tripData.startDate
            );

            if (isSaved && sessionUser) {
                if (confirm("This trip is saved. Also delete from profile?")) {
                    const updatedTrips = savedTrips.filter(trip => 
                        !(trip.destination === tripData.destination && trip.startDate === tripData.startDate)
                    );

                    localStorage.setItem("itineraries", JSON.stringify(updatedTrips));
                    sessionStorage.removeItem("tripData");
                    window.location.href = "planner.html";
                } else {
                    sessionStorage.removeItem("tripData");
                    window.location.href = "planner.html";
                }
            } else {
                if (confirm("Are you sure you want to clear this trip?")) {
                    sessionStorage.removeItem("tripData");
                    window.location.href = "planner.html";
                }
            }
        });
    }

    const editButton = document.getElementById("edit-trip-button");
    if (editButton) {
        editButton.addEventListener("click", () => {
            window.location.href = "planner.html";
        });
    }
} 