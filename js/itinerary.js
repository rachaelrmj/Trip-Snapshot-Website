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
        <h2>Personalized Itinerary</h2>
        <p>Here is your personalized itinerary based on your preferences and trip details.</p>
        <div class="trip-summary-card">
            <p><span>Destination</span><br> ${data.destination}</p>
            <p id="dates"><span>Trip Dates</span><br> ${data.startDate} to ${data.endDate}</p>
            <p><span>Preferences</span><br> ${selectedPreferences || 'None selected'}</p>
        </div>
        <hr>`;
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
                <h3 class="day-header">Day ${dayNum}</h3>
                <div class="itinerary-results"></div>
            `;
            const grid = daySection.querySelector(".itinerary-results");
            savedItinerary[key].forEach(item => {
                grid.appendChild(createSavedResultCard(item, key));
            });
            activitiesContainer.appendChild(daySection);
        }
    });

    // Append the activities block if it contains actual days
    if (activitiesContainer.children.length > 1) { 
        container.appendChild(activitiesContainer);
    }
}

function createSavedResultCard(item, dayKey) {
    const card = document.createElement("div");
    card.className = "result-card";

    // Check if the place is already in the user's global saved places
    const sessionUser = JSON.parse(sessionStorage.getItem("currentUser"));
    let isSaved = false;
    if (sessionUser) {
        const savedPlaces = JSON.parse(localStorage.getItem(`savedPlaces_${sessionUser.email}`)) || [];
        isSaved = savedPlaces.some(p => p.displayName === item.name);
    }

    const websiteHTML = item.website && item.website !== 'Not Available'
        ? `<p class="website-container">
            <a href="${item.website}" target="_blank" rel="noopener" class="website-link">
                Visit Website <span class="sr-only">for ${item.name}</span>
            </a>
           </p>`
        : `<p class="website-container"><span class="no-website">Website: Not Available</span></p>`;

    card.innerHTML = `
        <div class="card-image-container">
            <img src="${item.photo}" alt="${item.name}">
            <button class="remove-button" aria-label="Remove ${item.name} from itinerary">×</button>
        </div>
        <div class="card-content">
            <h3>${item.name}</h3>
            <p class="address">${item.address || ""}</p>
            <p>${item.number || "Not Available"}</p>
            <p>Rating: ${item.rating ? item.rating + ' ⭐' + '(' + item.userCount + ')' : 'No rating'}</p>
            ${websiteHTML}
            <p class="summary">Description: ${item.description || "Not Available"}</p>
            <button class="save-place-button ${isSaved ? 'is-added' : ''}">
                ${isSaved ? 'Saved to Profile' : 'Save Place'}
            </button>
        </div>
    `;

    // Remove from Itinerary Logic
    card.querySelector(".remove-button").addEventListener("click", () => {
        if (confirm(`Are you sure you want to remove ${item.name}?`)) {
            const saved = JSON.parse(sessionStorage.getItem("itinerary"));
            if (saved && saved[dayKey]) {
                saved[dayKey] = saved[dayKey].filter(i => i.name !== item.name);
                sessionStorage.setItem("itinerary", JSON.stringify(saved));
                window.location.reload(); 
            }
        }
    });

    // Toggle Save Place Logic
    const saveButton = card.querySelector(".save-place-button");
    saveButton.addEventListener("click", () => {
        const tripData = JSON.parse(sessionStorage.getItem("tripData"));
        const wasSaved = toggleSavePlace(
            item.name, 
            item.address, 
            item.photo, 
            item.website, 
            item.description,
            tripData.destination
        );
        
        if (wasSaved) {
            saveButton.textContent = 'Saved to Profile';
            saveButton.classList.add('is-added'); 
        } else {
            saveButton.textContent = 'Save Place';
            saveButton.classList.remove('is-added');
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

            // Combine data for comparison and profile save
            const currentSessionItinerary = {
                ...tripData,
                details: itinerary,
                savedAt: new Date().toLocaleString()
            };

            // Save to the specific user's itinerary collection in localStorage
            const storageKey = `savedItineraries_${sessionUser.email}`;
            let userSavedTrips = JSON.parse(localStorage.getItem(storageKey)) || [];
            
            // Find if this specific trip already exists in localStorage
            const existingTripIndex = userSavedTrips.findIndex(t => 
                t.destination === currentSessionItinerary.destination && 
                t.startDate === currentSessionItinerary.startDate
            );

            if (existingTripIndex !== -1) {
                const existingTrip = userSavedTrips[existingTripIndex];

                // Perform a deep comparison of the 'details' object
                const sessionDetailsString = JSON.stringify(currentSessionItinerary.details);
                const storedDetailsString = JSON.stringify(existingTrip.details);

                if (sessionDetailsString === storedDetailsString) {
                    // Display message if data is identical
                    alert("This itinerary is already saved and up to date!");
                } else {
                    // Update only if changes are detected
                    if (confirm("Changes detected. Would you like to update your saved itinerary?")) {
                        userSavedTrips[existingTripIndex] = currentSessionItinerary;
                        localStorage.setItem(storageKey, JSON.stringify(userSavedTrips));
                        alert("Itinerary updated successfully!");
                    }
                }
            } else {
                // Save as a completely new entry if it doesn't exist yet
                userSavedTrips.push(currentSessionItinerary);
                localStorage.setItem(storageKey, JSON.stringify(userSavedTrips));
                alert("Itinerary saved to your profile!");
            }
        });
    }

    const clearButton = document.getElementById("clear-itinerary-button");

    if (clearButton) {
        clearButton.addEventListener("click", () => {

            const tripData = JSON.parse(sessionStorage.getItem("tripData"));
            const sessionUser = JSON.parse(sessionStorage.getItem("currentUser"));

            const storageKey = sessionUser ? `savedItineraries_${sessionUser.email}` : null;
            const savedTrips = storageKey ? JSON.parse(localStorage.getItem(storageKey)) || [] : [];

            const isSaved = tripData && savedTrips.some(trip => 
                trip.destination === tripData.destination && 
                trip.startDate === tripData.startDate
            );

            if (isSaved && sessionUser) {
                if (confirm("This trip is saved in your profile. Would you like to clear the current session AND delete it from your profile?")) {
                    // Remove from localStorage
                    const updatedTrips = savedTrips.filter(trip => 
                        !(trip.destination === tripData.destination && trip.startDate === tripData.startDate)
                    );
                    localStorage.setItem(storageKey, JSON.stringify(updatedTrips));

                    // Clear session storage and redirect
                    sessionStorage.removeItem("tripData");
                    sessionStorage.removeItem("itinerary");
                    window.location.href = "planner.html";
                } else {
                    // Only clear session storage
                    sessionStorage.removeItem("tripData");
                    sessionStorage.removeItem("itinerary");
                    window.location.href = "planner.html";
                }
            } else {
                // Not saved or guest user
                if (confirm("Are you sure you want to clear your current itinerary?")) {
                    sessionStorage.removeItem("tripData");
                    sessionStorage.removeItem("itinerary");
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

    const resultsButton = document.getElementById("view-results-button");
    if (resultsButton) {
        resultsButton.addEventListener("click", () => {
            window.location.href = "results.html";
        });
    }
}