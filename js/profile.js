document.addEventListener("DOMContentLoaded", () => {
    // Check if a user is currently logged into this tab/session
    const sessionData = sessionStorage.getItem("currentUser");
    
    if (!sessionData) {
        // No session found; redirect to signup as the primary gatekeeper
        window.location.href = "signup.html";
        return;
    }

    const currentUser = JSON.parse(sessionData);

    // Define DOM elements immediately after verifying session
    const profileImg = document.getElementById("profile-image");
    const imageInput = document.getElementById("image-upload");
    const welcomeHeader = document.querySelector("#profile-overview h2");

    // Access the permanent account list to retrieve stored photos and handle deletion
    const allAccounts = JSON.parse(localStorage.getItem("accounts")) || [];
    const activeAccount = allAccounts.find(acc => acc.email === currentUser.email);

    // Set the profile picture logic: Check Session first, then LocalStorage, then fallback
    const savedPhoto = currentUser.profilePic || (activeAccount && activeAccount.profilePic);

    if (profileImg) {
        if (savedPhoto) {
            profileImg.src = savedPhoto;
        } else {
            // Fallback if no photo is found
            profileImg.src = "images/profile-logo.svg";
        }
    }

    // Display the first name captured during signup, falling back to email prefix if necessary
    if (welcomeHeader) {
        const name = currentUser.fname || currentUser.email.split('@')[0];
        welcomeHeader.textContent = `Welcome, ${name}!`;
    }

    // Profile Image Upload Logic
    if (imageInput) {
        imageInput.addEventListener("change", function(event) {
            const selectedFile = event.target.files[0];
            if (selectedFile) {
                const fileReader = new FileReader();
                
                fileReader.onload = function(e) {
                    const base64Data = e.target.result;
                    
                    // 1. Update the screen immediately
                    if (profileImg) profileImg.src = base64Data;

                    // 2. Update the session so the change persists across this tab
                    const userToUpdate = JSON.parse(sessionStorage.getItem("currentUser"));
                    userToUpdate.profilePic = base64Data;
                    sessionStorage.setItem("currentUser", JSON.stringify(userToUpdate));

                    // 3. Update the permanent account database
                    const updatedList = allAccounts.map(acc => {
                        if (acc.email === userToUpdate.email) {
                            return { ...acc, profilePic: base64Data };
                        }
                        return acc;
                    });
                    localStorage.setItem("accounts", JSON.stringify(updatedList));
                };
                
                fileReader.readAsDataURL(selectedFile);
            }
        });
    }

    // Account Deletion Logic
    const deleteLink = document.getElementById("delete-account-link");
    const deletePopup = document.getElementById("delete-confirmation");
    const confirmDeleteBtn = document.getElementById("confirm-delete-btn");
    const cancelDeleteBtn = document.getElementById("cancel-delete-btn");

    // Open the confirmation popup
    if (deleteLink && deletePopup) {
        deleteLink.addEventListener("click", (e) => {
            e.preventDefault();
            deletePopup.style.display = "flex";
        });
    }

    // Close popup if user cancels
    if (cancelDeleteBtn && deletePopup) {
        cancelDeleteBtn.addEventListener("click", () => {
            deletePopup.style.display = "none";
        });
    }

    // Execute permanent removal of the account
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener("click", () => {
            // Remove the user from the permanent localStorage database
            const filteredAccounts = allAccounts.filter(acc => acc.email !== currentUser.email);
            localStorage.setItem("accounts", JSON.stringify(filteredAccounts));

            // Clear the current session storage
            sessionStorage.removeItem("currentUser");

            // Redirect to home page after account is wiped
            window.location.href = "index.html";
        });
    }

    // Manually ends the session without deleting permanent account data
    const logoutBtn = document.getElementById("logout-link");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            sessionStorage.removeItem("currentUser");
            window.location.href = "index.html";
        });
    }

    // Load dynamic content areas
    showSavedItineraries();
    showRecentSearches();
});

// Helper to display saved itineraries with clickable functionality
function showSavedItineraries() {
    const container = document.getElementById("saved-itineraries-container");
    if (!container) return;

    const trips = JSON.parse(localStorage.getItem("itineraries")) || [];
    
    if (trips.length === 0) {
        container.innerHTML = `<p class="empty-state">No itineraries saved yet. <a href="planner.html">Start planning now!</a></p>`;
        return;
    }

    // Clear and render cards
    container.innerHTML = trips.map((trip, index) => `
        <div class="itinerary-card" data-index="${index}">
            <div class="card-badge">Trip Snapshot</div>
            <h3>${trip.destination}</h3>
            <p class="card-dates">${trip.startDate} — ${trip.endDate}</p>
            <span class="view-link">View Details →</span>
        </div>
    `).join('');

    // Add click listeners to each card
    const cards = container.querySelectorAll(".itinerary-card");
    cards.forEach(card => {
        card.addEventListener("click", () => {
            const index = card.getAttribute("data-index");
            const selectedTrip = trips[index];

            // 1. Overwrite sessionStorage with this specific trip's data
            sessionStorage.setItem("tripData", JSON.stringify(selectedTrip));

            // 2. Redirect to the itinerary page to view the results
            window.location.href = "itinerary.html";
        });
    });
}

// Helper to display recent searches
function showRecentSearches() {
    const container = document.getElementById("recent-searches-container");
    if (!container) return;

    const searches = JSON.parse(localStorage.getItem("recentSearches")) || [];
    
    if (searches.length === 0) {
        container.innerHTML = `<p>No recent searches found.</p>`;
        return;
    }

    container.innerHTML = searches.map(search => `
        <div class="search-card">
            <h4>${search.destination}</h4>
            <p>${search.startDate} - ${search.endDate}</p>
            <small>Searched on: ${search.timestamp}</small>
        </div>
    `).join('');
}