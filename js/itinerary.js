document.addEventListener("DOMContentLoaded", () => {
    // Retrieve trip data from sessionStorage and store in the variable tripData
    const tripData = JSON.parse(sessionStorage.getItem("tripData"));
    // Query the main element and save as mainContent
    const mainContent = document.querySelector("main"); 

    if (!tripData) {
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
    
    const start = new Date(data.startDate + 'T00:00:00');
    const end = new Date(data.endDate + 'T00:00:00');
    
    const diffTime = end - start;
    const totalDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    container.innerHTML = "";

    for (let i = 1; i <= totalDays; i++) {
        const daySection = document.createElement("section");
        daySection.className = "itinerary-day"; 

        daySection.innerHTML = `
            <h2>Day ${i}</h2>
            <div class="itinerary-results" id="day-${i}-results"></div>
        `;

        container.appendChild(daySection);

        await populateDayResults(i, data);
    }
}

// Function to populate the results for a specific day based on the user's preferences and the trip data
async function populateDayResults(dayNumber, data) {
    const grid = document.getElementById(`day-${dayNumber}-results`);

    const { Place, SearchByTextRankPreference } = await google.maps.importLibrary("places");

    const preferenceMapping = {
        restaurant: { label: 'Restaurants & Dining', query: 'Highly Rated Restaurants' },
        shopping: { label: 'Shopping & Malls', query: 'Popular Shopping Spots' },
        attraction: { label: 'Top Attractions', query: 'Best Tourist Attractions' },
        nightlife: { label: 'Nightlife', query: 'Highly Rated Bars and Clubs' },
        hotel: { label: 'Lodging & Accommodations', query: 'Top Rated Hotels' },
        flight: { label: 'Airport Information', query: 'Nearest Airports' },
        rental: { label: 'Rental Cars', query: 'Nearest Rental Car Companies' },
        transportation: { label: 'Transportation', query: 'transportation' }
    };

    const travelPreferences = { ...data.activities, ...data.travelNeeds };

    for (const [preference, isSelected] of Object.entries(travelPreferences)) {
        if (isSelected && preferenceMapping[preference]) {

            const categorySection = document.createElement("div");
            categorySection.className = "category-group";
            
            const categoryHeader = document.createElement("h4");
            categoryHeader.className = "category-title";
            categoryHeader.innerText = preferenceMapping[preference].label;
            categorySection.appendChild(categoryHeader);

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
                    if (!data.photoUrl && places[0].photos && places[0].photos.length > 0) {
                                data.photoUrl = places[0].photos[0].getURI({ maxWidth: 800 });
                                // Update the session storage so the "Save Itinerary" button sees this new photo
                                sessionStorage.setItem("tripData", JSON.stringify(data));
                            }
                            
                    const sortedPlaces = places.sort((a, b) => (b.rating || 0) - (a.rating || 0));

                    const cardsPerSection = 5;
                    const startIndex = (dayNumber - 1) % Math.max(1, Math.floor(sortedPlaces.length / cardsPerSection));
                    const daySelection = sortedPlaces.slice(startIndex * cardsPerSection, (startIndex * cardsPerSection) + cardsPerSection);

                    daySelection.forEach(place => {
                        const card = createResultCard(place);
                        categoryGrid.appendChild(card);
                    });

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
        <button class="save-btn">
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

    const btn = resultContainer.querySelector(".save-btn");
    if (btn) {
        btn.addEventListener("click", () => {
            const currentTrip = JSON.parse(sessionStorage.getItem("tripData"));
            const wasSaved = toggleSavePlace(
                place.displayName, 
                place.formattedAddress, 
                photoUrl, 
                place.websiteURI, 
                place.editorialSummary,
                currentTrip.destination
            );
            
            btn.innerHTML = wasSaved ? '❤️' : '🤍';
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

    const homeBtn = document.getElementById("homepage-button");
    if (homeBtn) {
        homeBtn.addEventListener("click", () => {
            window.location.href = "index.html";
        });
    }

    const saveBtn = document.getElementById("save-itinerary-button");
    if (saveBtn) {
        saveBtn.addEventListener("click", () => {

            const sessionUser = JSON.parse(sessionStorage.getItem("currentUser"));
            if (!sessionUser) {
                alert("You must be signed in to save itineraries.");
                window.location.href = "login.html";
                return;
            }

            const tripData = sessionStorage.getItem("tripData");
            if (!tripData) {
                alert("No itinerary data found to save.");
                return;
            }

            const savedTrips = JSON.parse(localStorage.getItem("itineraries")) || [];
            savedTrips.push(JSON.parse(tripData));
            localStorage.setItem("itineraries", JSON.stringify(savedTrips));

            alert("Trip has been saved to your profile!");
        });
    }

    const clearBtn = document.getElementById("clear-itinerary-button");

    if (clearBtn) {
        clearBtn.addEventListener("click", () => {

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

    const editBtn = document.getElementById("edit-trip-button");
    if (editBtn) {
        editBtn.addEventListener("click", () => {
            window.location.href = "planner.html";
        });
    }
}