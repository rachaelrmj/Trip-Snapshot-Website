document.addEventListener("DOMContentLoaded", () => {
    // Load stored trip data from sessionStorage (active session only)
    const tripData = JSON.parse(sessionStorage.getItem("tripData"));

    const savedItinerary = JSON.parse(sessionStorage.getItem("itinerary"));

    if (savedItinerary && tripData) {
        const mismatch = Object.values(savedItinerary).flat().some(item => 
            item.destination && item.destination !== tripData.destination
        );

        if (mismatch) {
            console.warn("Itinerary mismatch detected. Resetting.");
            sessionStorage.removeItem("itinerary");
        }
    }

    // Main page container for rendering content dynamically
    const mainContent = document.querySelector("main"); 

    // If no trip exists, show empty state container instead of itinerary
    if (!tripData) {
        if (mainContent) {
            mainContent.innerHTML = `
                <section id="empty-itinerary-message">
                    <h2>No Itinerary Found</h2>
                    <p>You must plan a trip in order to see an itinerary.</p>
                    <a href="planner.html" class="action-buttons">Start Planning Now</a>
                </section>
            `;
        }

        console.error("Trip data not found (sessionStorage is empty)");
        return; // Prevent downstream functions from running without data
    }

    // Call display functions and actions button logic
    displayOverview(tripData);
    displayItinerary(tripData);
    setupActionButtons();
});

// Display trip overview
function displayOverview(data) {
    const overviewContainer = document.getElementById("itinerary-overview");
    if (!overviewContainer) return;

    // Merge selected preferences into a single object for formatting
    const allPreferences = { 
        ...data.activities, 
        ...data.travelNeeds 
    };

    // Convert selected preference keys into readable labels
    const selectedPreferences = Object.keys(allPreferences)
        .filter(key => allPreferences[key] === true)
        .map(key => {
            let formatted = key.replace(/([A-Z])/g, ' $1').trim().toLowerCase();
            return formatted.charAt(0).toUpperCase() + formatted.slice(1);
        })
        .join(", ");

    // Display trip summary
    overviewContainer.innerHTML = `
        <h2>Itinerary Snapshot</h2>
        <p>Here is your personalized itinerary based on your preferences and trip details.</p>

        <div class="trip-summary-card">
            <p><span>Destination</span><br> ${data.destination}</p>
            <p id="dates"><span>Trip Dates</span><br> ${data.startDate} to ${data.endDate}</p>
            <p><span>Preferences</span><br> ${selectedPreferences || 'None selected'}</p>
        </div>

        <hr>
    `;
}

// Display itinerary
async function displayItinerary(data) {
    const container = document.getElementById("itinerary-container");

    // Load saved itinerary structure from sessionStorage
    const savedItinerary = JSON.parse(sessionStorage.getItem("itinerary"));

    if (!savedItinerary) {
        container.innerHTML = "<p>No items added to your itinerary yet.</p>";
        return;
    }

    container.innerHTML = "";

    // Display travel needs section
    if (savedItinerary.travelNeeds?.length > 0) {
        const travelSection = document.createElement("section");
        travelSection.id = "travel-needs-section";
        travelSection.className = "itinerary-day";

        travelSection.innerHTML = `
            <h2 class="section-main-title">Travel Needs</h2>
            <div class="itinerary-results"></div> 
        `;

        const grid = travelSection.querySelector(".itinerary-results");

        // Create cards for each saved travel need item
        savedItinerary.travelNeeds.forEach(item => {
            grid.appendChild(createSavedResultCard(item, 'travelNeeds'));
        });

        container.appendChild(travelSection);
    }

    // Display Daily activities section
    const activitiesContainer = document.createElement("section"); 
    activitiesContainer.id = "activities-container";
    activitiesContainer.innerHTML = `<h2 class="section-main-title">Daily Activities</h2>`;

    // Loop through each day in itinerary
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

    // Only append if at least one day exists
    if (activitiesContainer.children.length > 1) {
        container.appendChild(activitiesContainer);
    }
}

// Create trip results card
function createSavedResultCard(item, dayKey) {
    const card = document.createElement("div");
    card.className = "result-card";

    // Check if place is already saved in user's profile
    const sessionUser = JSON.parse(sessionStorage.getItem("currentUser"));
    let isSaved = false;

    if (sessionUser) {
        const savedPlaces = JSON.parse(
            localStorage.getItem(`savedPlaces_${sessionUser.email}`)
        ) || [];

        isSaved = savedPlaces.some(p => p.displayName === item.name);
    }

    // Display website link or fallback message
    const websiteHTML = item.website && item.website !== 'Not Available'
        ? `<p class="website-container">
            <a href="${item.website}" target="_blank" rel="noopener" class="website-link">
                Visit Website <span class="sr-only">for ${item.name}</span>
            </a>
           </p>`
        : `<p class="website-container"><span class="no-website">Website: Not Available</span></p>`;

    // Display result card
    card.innerHTML = `
        <div class="card-image-container">
            <img src="${item.photo || "images/results-page/no-photo.svg"}" alt="${item.name}">
            <button class="remove-button" aria-label="Remove ${item.name} from itinerary">x</button>
        </div>

        <div class="card-content">
            <h3>${item.name}</h3>
            <p class="address">${item.address || ""}</p>
            <p>${item.number || "Not Available"}</p>
            <p>Rating: ${item.rating ? item.rating + ' ⭐(' + item.userCount + ')' : 'No rating'}</p>
            ${websiteHTML}
            <p class="summary">Description: ${item.description || "Not Available"}</p>

            <button class="save-place-button ${isSaved ? 'is-added' : ''}">
                ${isSaved ? 'Saved to Profile' : 'Save Place'}
            </button>
        </div>
    `;

    // Remove item from itinerary (sessionStorage update)
    card.querySelector(".remove-button").addEventListener("click", () => {
        if (confirm(`Are you sure you want to remove ${item.name}?`)) {
            const saved = JSON.parse(sessionStorage.getItem("itinerary"));

            if (saved?.[dayKey]) {
                saved[dayKey] = saved[dayKey].filter(i => i.name !== item.name);

                sessionStorage.setItem("itinerary", JSON.stringify(saved));
                window.location.reload();
            }
        }
    });

    // Save/unsave place toggle (profile persistence)
    const saveButton = card.querySelector(".save-place-button");

    saveButton.addEventListener("click", () => {
        const tripData = JSON.parse(sessionStorage.getItem("tripData"));

        const isNowSaved = toggleSavePlace(
            item.name,
            item.address,
            item.photo,
            item.website,
            item.description,
            item.rating,
            item.userCount,
            tripData.destination
        );

        if (isNowSaved) {
            saveButton.textContent = 'Saved to Profile';
            saveButton.classList.add('is-added');
        } else {
            saveButton.textContent = 'Save Place';
            saveButton.classList.remove('is-added');
        }
    });
    return card;
}

// Save Place Toggle
function toggleSavePlace(name, address, photo, website, description, rating, userCount, destination) {
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
        return false;
    } else {
        savedPlaces.push({
            displayName: name,
            formattedAddress: address,
            photoUrl: photo,
            websiteURI: website,
            description,
            rating,
            userCount,
            destination,
            savedAt: new Date().toISOString()
        });

        localStorage.setItem(storageKey, JSON.stringify(savedPlaces));
        return true;
    }
}

// Action buttons
function setupActionButtons() {

    // Navigate back to homepage
    document.getElementById("homepage-button")
        ?.addEventListener("click", () => {
            window.location.href = "index.html";
        });

    // Save full itinerary to user profile
    const saveButton = document.getElementById("save-itinerary-button");

    if (saveButton) {
        saveButton.addEventListener("click", () => {
            const sessionUser = JSON.parse(sessionStorage.getItem("currentUser"));

            if (!sessionUser) {
                alert("You must be signed in to save itineraries.");
                window.location.href = "login.html";
                return;
            }

            const tripData = JSON.parse(sessionStorage.getItem("tripData"));
            const itinerary = JSON.parse(sessionStorage.getItem("itinerary"));

            if (!tripData || !itinerary) {
                alert("No itinerary data found to save.");
                return;
            }

            const currentSessionItinerary = {
                ...tripData,
                details: itinerary,
                savedAt: new Date().toLocaleString()
            };

            const storageKey = `savedItineraries_${sessionUser.email}`;
            let userSavedTrips = JSON.parse(localStorage.getItem(storageKey)) || [];

            const existingIndex = userSavedTrips.findIndex(t =>
                t.destination === currentSessionItinerary.destination &&
                t.startDate === currentSessionItinerary.startDate
            );

            if (existingIndex !== -1) {

                const existingTrip = userSavedTrips[existingIndex];

                if (JSON.stringify(existingTrip.details) === JSON.stringify(currentSessionItinerary.details)) {
                    alert("This itinerary is already saved and up to date!");
                } else {
                    if (confirm("Changes detected. Update saved itinerary?")) {
                        userSavedTrips[existingIndex] = currentSessionItinerary;
                        localStorage.setItem(storageKey, JSON.stringify(userSavedTrips));
                        alert("Itinerary updated successfully!");
                    }
                }

            } else {
                userSavedTrips.push(currentSessionItinerary);
                localStorage.setItem(storageKey, JSON.stringify(userSavedTrips));
                alert("Itinerary saved to your profile!");
            }
        });
    }

    // Clear current itinerary session
    document.getElementById("clear-itinerary-button")
        ?.addEventListener("click", () => {

            const tripData = JSON.parse(sessionStorage.getItem("tripData"));
            const sessionUser = JSON.parse(sessionStorage.getItem("currentUser"));

            const storageKey = sessionUser ? `savedItineraries_${sessionUser.email}` : null;
            const savedTrips = storageKey ? JSON.parse(localStorage.getItem(storageKey)) || [] : [];

            const isSaved = tripData && savedTrips.some(trip =>
                trip.destination === tripData.destination &&
                trip.startDate === tripData.startDate
            );

            if (isSaved && sessionUser) {
                if (confirm("Delete this trip from your profile AND current session?")) {
                    const updatedTrips = savedTrips.filter(trip =>
                        !(trip.destination === tripData.destination &&
                          trip.startDate === tripData.startDate)
                    );

                    localStorage.setItem(storageKey, JSON.stringify(updatedTrips));

                    sessionStorage.removeItem("itinerary");
                  
                    window.location.href = "results.html";
                } else {;
                    sessionStorage.removeItem("itinerary");
                    window.location.href = "results.html";
                }

            } else {
                if (confirm("Clear current itinerary?")) {
                    sessionStorage.removeItem("itinerary");
                    window.location.href = "results.html";
                }
            }
        });

    // If edit trip button is clicked....
    document.getElementById("edit-trip-button")
        ?.addEventListener("click", () => {
            // Redirect to planner page
            window.location.href = "planner.html";
        });

    // If view results button is clicked....
    document.getElementById("view-results-button")
        ?.addEventListener("click", () => {
            // Redirect to results page
            window.location.href = "results.html";
        });
}