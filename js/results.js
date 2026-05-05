document.addEventListener("DOMContentLoaded", async () => {
    // Retrieve trip data from sessionStorage and store in the variable tripData
    const tripData = JSON.parse(sessionStorage.getItem("tripData"));
    // Query the main element and save as mainContent
    const mainContent = document.querySelector("main"); 

    // If there is no tripData in sessionStorage...
    if (!tripData) {
        // Display message to user informing them they must plan a trip in order to see trip results
        if (mainContent) {
            mainContent.innerHTML = `
            <section id="empty-results-message">
                    <h2>No Results Found</h2>

                    <p>You must plan a trip to see results.</p>

                    <a href="planner.html" class="action-buttons">Start Planning Now</a>
            </section>
            `;
        }
        // Log an error message to the console if trip data is not found in sessionStorage
        console.error("Trip data not found");
        // Stop further execution so Google Maps doesn't try to load
        return;
    }

    const savedItinerary = sessionStorage.getItem("itinerary");
    if (savedItinerary) {
        itinerary = JSON.parse(savedItinerary);
    }

    const savedResults = sessionStorage.getItem("results");
    if (savedResults) {
        results = JSON.parse(savedResults);
    } else {
        results = { travelNeeds: [] };
    }

    // Call the function to display the itinerary with the retrieved trip data
    displayOverview(tripData);

    try {
        await google.maps.importLibrary("places");
        // Call the function to display the trip data and results
        displayResults(tripData);
    } catch (e) {
        console.error("Maps library failed to load on navigation", e);
    }

    // Set up event listeners for itinerary action buttons
    setupActionButtons();
});

// Store the user's travel needs preferences/selections in an array into the itinerary variable
let itinerary = { travelNeeds: [] }; 
// Initialize an empty array stored in the tripDays variable
let tripDays = [];

// Function to show destination, dates, and selected preferences from sessionStorage
function displayOverview(data) {
    // Get the itinerary-overview HTML element and store in the overviewContainer variable
    const overviewContainer = document.getElementById("results-overview");
    // If no such element exists, exit function
    if (!overviewContainer) return;

    // Format the preferences into a readable list and store in the applicable variable
    const activities = data.activities || {};
    const travelNeeds = data.travelNeeds || {};
    const allPreferences = { ...activities, ...travelNeeds };

    const selectedPreferences = Object.keys(allPreferences)
        .filter(key => allPreferences[key] === true)
        .map(key => {
            let formatted = key.replace(/([A-Z])/g, ' $1').trim().toLowerCase();
            return formatted.charAt(0).toUpperCase() + formatted.slice(1);
        })
        .join(", ");

    overviewContainer.innerHTML = `
        <h2>Trip Results</h2>
        <p>Browse and add places to your itinerary.</p>
        <div class="trip-summary-card">
            <p><span>Destination</span><br> ${data.destination}</p>
            <p id="dates"><span>Trip Dates</span><br> ${data.startDate} to ${data.endDate}</p>
            <p><span>Preferences</span><br> ${selectedPreferences || 'None selected'}</p>
        </div>
        <hr>`;
}

// Function to show trip results based on the provided trip data from sessionStorage
async function displayResults(data) {
    const container = document.getElementById("results-container");
    if (!container) return;
    container.innerHTML = "";

    const start = new Date(data.startDate + "T00:00:00");
    const end = new Date(data.endDate + "T00:00:00");
    const diffTime = end - start;
    const totalDays = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1);

    tripDays = generateTripDays(data.startDate, totalDays);
    
    tripDays.forEach(d => {
        if (!itinerary[d.key]) itinerary[d.key] = [];
    });

    const preferenceMapping = {
        restaurant: { label: 'Restaurants & Dining', query: 'Highly Rated Restaurants' },
        shopping: { label: 'Shopping & Malls', query: 'Popular Shopping Spots' },
        attraction: { label: 'Top Attractions', query: 'Best Tourist Attractions' },
        nightlife: { label: 'Nightlife', query: 'Highly Rated Bars and Clubs' },
        hotel: { label: 'Lodging & Accommodations', query: 'Top Rated Hotels' },
        flight: { label: 'Airport Information', query: 'Nearest Airports' },
        rental: { label: 'Rental Cars', query: 'Nearest Rental Car Companies' },
        transportation: { label: 'Transportation Hubs', query: 'Transportation' }
    };

    const travelPreferences = { ...(data.activities || {}), ...(data.travelNeeds || {}) };

    // Display each selected category
    for (const [preference, isSelected] of Object.entries(travelPreferences)) {
        if (!isSelected || !preferenceMapping[preference]) continue;

        const section = document.createElement("div");
        section.className = "category-group";
        section.innerHTML = `
            <h4 class="category-title">${preferenceMapping[preference].label}</h4>
            <div class="trip-results" id="${preference}-results"></div>`;
        container.appendChild(section);

        await fetchPlaces(preference, data.destination, preferenceMapping[preference].query);
    }
}

async function fetchPlaces(preference, destination, query) {
    const grid = document.getElementById(`${preference}-results`);
    if (!grid) return;

    try {
        const { Place, SearchByTextRankPreference } = await google.maps.importLibrary("places");
        const request = {
            textQuery: `${query} in ${destination}`,
            maxResultCount: 8,
            rankPreference: SearchByTextRankPreference.RELEVANCE,
            fields: ["displayName", "formattedAddress", "rating", "userRatingCount", "photos", "websiteURI", "editorialSummary", "nationalPhoneNumber"]
        };

        const { places } = await Place.searchByText(request);

if (places) {
    if (!results[preference]) results[preference] = [];

    results[preference] = places.map(p => ({
        name: p.displayName,
        address: p.formattedAddress,
        rating: p.rating,
        userCount: p.userRatingCount,
        website: p.websiteURI,
        description: p.editorialSummary,
        photo: (p.photos && p.photos.length > 0)
            ? p.photos[0].getURI({ maxWidth: 400, maxHeight: 300 })
            : "images/results-page/no-photo.svg"
    }));

    sessionStorage.setItem("results", JSON.stringify(results));

    places.forEach(place => grid.appendChild(createResultCard(place, preference)));
}
    } catch (err) { 
        console.error("Fetch failed for " + preference, err); 
    }
}

function createResultCard(place, preference) {
    const photo = (place.photos && place.photos.length > 0) ? place.photos[0].getURI({ maxWidth: 400, maxHeight: 300 }) 
    : "images/results-page/no-photo.svg";

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

    const card = document.createElement("div");
    card.className = `result-card ${isSaved ? 'saved' : ''}`;

    const website = place.websiteURI 
        ? `<a href="${place.websiteURI}" target="_blank" rel="noopener" class="website-link">
            Visit Website <span class="sr-only">for ${place.displayName}</span>
        </a>` 
        : `<span class="no-website">Website: Not Available</span>`;   

    // Logic for Travel Needs vs Activities
    const travelNeedKeys = ['flight', 'hotel', 'rental', 'transportation'];
    const isTravelNeed = travelNeedKeys.includes(preference);

    let isAlreadyAdded = false;
    let buttonText = isTravelNeed ? 'Add to Trip' : 'Add to Day';

    if (isTravelNeed) {
        isAlreadyAdded = itinerary.travelNeeds.some(item => item.name === place.displayName);
        if (isAlreadyAdded) buttonText = "Added to Itinerary";
    } else {
        const addedDays = Object.keys(itinerary)
            .filter(key => key.startsWith('day') && Array.isArray(itinerary[key]) && itinerary[key].some(item => item.name === place.displayName))
            .map(key => key.replace('day', ''));
        
        if (addedDays.length > 0) {
            isAlreadyAdded = true;
            buttonText = `Added to Day ${addedDays.join(' & ')}`;
        }
    }

    const imgTag = photo
    ? `<img src="${photo}" alt="${place.displayName}">`
    : `<div class="no-photo">No photo available</div>`;

    card.innerHTML = `
        ${imgTag}
        <h3>${place.displayName}</h3>
        <p class="address">${place.formattedAddress || ""}</p>
        <p>${place.nationalPhoneNumber ? place.nationalPhoneNumber : 'Not Available'}</p>
        <p>Rating: ${place.rating ? place.rating + ' ⭐' + '(' + place.userRatingCount + ')' : 'No rating'}</p>
        <p class="website-container">${website}</p>
        <p class="summary">Description: ${place.editorialSummary ? place.editorialSummary : 'Not Available'}</p>
        <div class="photo-spread">
            ${photoSpread}
        </div>
        <button class="add-button ${isAlreadyAdded ? 'is-added' : ''}">${buttonText}</button>
    `;

    const addButton = card.querySelector(".add-button");
    addButton.addEventListener("click", () => {
        if (isTravelNeed) {
            // Check for existing travel need before pushing
            const alreadyAdded = itinerary.travelNeeds.some(item => item.name === place.displayName);
            if (alreadyAdded) {
                alert("This is already in your itinerary.");
                return;
            }

            itinerary.travelNeeds.push({ 
                name: place.displayName || 'Not Available', 
                address: place.formattedAddress || 'Not Available', 
                photo: place.photo || 'Not Available', 
                number: place.nationalPhoneNumber || 'Not Available', 
                rating: place.rating || 'Not Available', 
                userCount: place.userRatingCount || 'Not Available', 
                website: place.websiteURI || 'Not Available', 
                description: place.editorialSummary || 'Not Available' 
            });
            sessionStorage.setItem("itinerary", JSON.stringify(itinerary));
            
            addButton.textContent = "Added to Itinerary"; 
            addButton.classList.add("is-added");
        } else {
            dayPopupWindow(place, photo, addButton);
        }
    });
    return card;
}

function generateTripDays(startDate, totalDays) {
    const days = [];
    const start = new Date(startDate + "T00:00:00");
    for (let i = 0; i < totalDays; i++) {
        const current = new Date(start);
        current.setDate(start.getDate() + i);
        days.push({
            label: `Day ${i + 1} - ${current.toLocaleDateString("en-US", { month: "long", day: "numeric" })}`,
            key: `day${i + 1}`
        });
    }
    return days;
}

function dayPopupWindow(place, photo, addButton) {
    const existing = document.getElementById("day-modal");
    if (existing) existing.remove();

    const modal = document.createElement("div");
    modal.id = "day-modal";
    modal.innerHTML = `
        <div class="modal-backdrop"></div>
        <div class="modal-content">
            <h3>Select a Day</h3>
            <div class="day-list">
                ${tripDays.map(d => `<button class="day-option" data-day="${d.key}">${d.label}</button>`).join("")}
            </div>
            <button id="close-modal">Cancel</button>
        </div>`;
    document.body.appendChild(modal);

    modal.querySelectorAll(".day-option").forEach(button => {
    button.addEventListener("click", () => {
            const dayKey = button.dataset.day;

            // Check if this specific place name already exists in the selected day's array
            const alreadyInDay = itinerary[dayKey].some(item => item.name === place.displayName);

            if (alreadyInDay) {
                alert(`"${place.displayName}" is already added to ${button.textContent.split(' - ')[0]}!`);
                modal.remove(); 
                return;
            }

            itinerary[dayKey].push({ 
                name: place.displayName || 'Not Available', 
                address: place.formattedAddress || 'Not Available', 
                photo: photo || 'Not Available', 
                number: place.nationalPhoneNumber || 'Not Available', 
                rating: place.rating || 'Not Available', 
                userCount: place.userRatingCount || 'Not Available', 
                website: place.websiteURI || 'Not Available', 
                description: place.editorialSummary || 'Not Available' 
            });

            // Save back to session
            sessionStorage.setItem("itinerary", JSON.stringify(itinerary));

            const addedDays = Object.keys(itinerary)
                .filter(key => key.startsWith('day') && Array.isArray(itinerary[key]) && itinerary[key].some(item => item.name === place.displayName))
                .map(key => key.replace('day', ''));

            if (addButton) {
                addButton.textContent = `Added to Day ${addedDays.join(' & ')}`;
                addButton.classList.add("is-added");
            }
            
            modal.remove();
        });
    });

    modal.querySelector("#close-modal").addEventListener("click", () => modal.remove());
}

function setupActionButtons() {
    document.getElementById("view-itinerary-button")?.addEventListener("click", () => {
        const savedItinerary = sessionStorage.getItem("itinerary");
        if (!savedItinerary) {
            alert("You haven't added anything to your itinerary yet. Choose your preferences.");
            return;
        }
        window.location.href = "itinerary.html";
    });

    document.getElementById("homepage-button")?.addEventListener("click", () => window.location.href = "index.html");

    document.getElementById("edit-trip-button")?.addEventListener("click", () => window.location.href = "planner.html");
    
    const saveResultsBtn = document.getElementById("save-results-button");

    if (saveResultsBtn) {
        saveResultsBtn.addEventListener("click", () => {
            const sessionUser = JSON.parse(sessionStorage.getItem("currentUser")); 
    
            if (!sessionUser) {
                sessionStorage.setItem("redirectAfterLogin", window.location.href);

                alert("You must be signed in to save results.");
                window.location.href = "login.html";
                return;
            }

            const tripDataStr = sessionStorage.getItem("tripData");
            if (!tripDataStr) {
                alert("No results data found to save.");
                return;
            }

            const newResult = JSON.parse(tripDataStr);
            const storageKey = `savedResults_${sessionUser.email}`;
            const savedResults = JSON.parse(localStorage.getItem(storageKey)) || [];
            
            const isDuplicate = savedResults.some(trip => {
                const sameDest = trip.destination === newResult.destination;
                const sameDates = trip.startDate === newResult.startDate && trip.endDate === newResult.endDate;
                
                const sameActivities = JSON.stringify(trip.activities) === JSON.stringify(newResult.activities);
                const sameTravel = JSON.stringify(trip.travelNeeds) === JSON.stringify(newResult.travelNeeds);

                return sameDest && sameDates && sameActivities && sameTravel;
            });

            if (!isDuplicate) {
                savedResults.push({
                    ...newResult,
                    savedAt: new Date().toISOString()
                });
                localStorage.setItem(storageKey, JSON.stringify(savedResults));
                alert("Trip Result has been saved to your profile!");
            } else {
                alert("This exact trip result is already saved in your profile.");
            }
        });
    }

    const clearButton = document.getElementById("clear-results-button");

    if (clearButton) {
        clearButton.addEventListener("click", () => {
            const tripData = JSON.parse(sessionStorage.getItem("tripData"));

            const sessionUser = JSON.parse(sessionStorage.getItem("currentUser"));

            const storageKey = sessionUser ? `savedResults_${sessionUser.email}` : null;
            const savedResults = storageKey ? JSON.parse(localStorage.getItem(storageKey)) || [] : [];

            const isSaved = tripData && savedResults.some(trip => 
                trip.destination === tripData.destination && 
                trip.startDate === tripData.startDate
            );

            if (isSaved && sessionUser) {
                if (confirm("These results are saved. Also delete from profile?")) {
                    const updatedResults = savedResults.filter(trip => 
                        !(trip.destination === tripData.destination && trip.startDate === tripData.startDate)
                    );

                    localStorage.setItem(storageKey, JSON.stringify(updatedResults));

                    sessionStorage.removeItem("tripData");
                    sessionStorage.removeItem("results");
                    window.location.href = "planner.html";
                } else {
                    sessionStorage.removeItem("tripData");
                    sessionStorage.removeItem("results");
                    window.location.href = "planner.html";
                }
            } else {
                if (confirm("Are you sure you want to clear your results? This will reset your search and selections.")) {
                    sessionStorage.removeItem("tripData");
                    sessionStorage.removeItem("results");
                    window.location.href = "planner.html";
                }
            }
        }); 
    }
}