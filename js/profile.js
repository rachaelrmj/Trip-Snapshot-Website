document.addEventListener("DOMContentLoaded", () => {
    // Check if a user is currently logged into this tab/session
    const sessionData = sessionStorage.getItem("currentUser");
    const accounts = JSON.parse(localStorage.getItem("accounts")) || [];

    // 1. Check if session exists
    if (!sessionData) {
        window.location.href = "login.html";
        return;
    }

    const currentUser = JSON.parse(sessionData);

    // 2. Verify that this user exists in the permanent account list
    const accountExists = accounts.some(acc => acc.email.toLowerCase() === currentUser.email.toLowerCase());

    if (!accountExists) {
        // If the account was deleted or doesn't exist, clear session and redirect
        sessionStorage.removeItem("currentUser");
        window.location.href = "signup.html";
        return;
    }

    const welcomeHeader = document.querySelector("#profile-overview h2");

    // Display the first name captured during signup, falling back to email prefix if necessary
    if (welcomeHeader) {
        const name = currentUser.fname || currentUser.email.split('@')[0];
        welcomeHeader.textContent = `Welcome, ${name}!`;
    }

    // --- Profile Settings Selectors ---
    const editProfileLink = document.getElementById("edit-profile-link");
    const profileSection = document.getElementById("profile-settings");
    const profileForm = document.getElementById("profile-update-form");
    const closeProfileBtn = document.getElementById("close-profile-btn");

    // --- Password Settings Selectors ---
    const updatePasswordLink = document.getElementById("updatePassword-link");
    const passwordSection = document.getElementById("password-update");
    const passwordForm = document.getElementById("password-update-form");
    const closeSecurityBtn = document.getElementById("close-security-btn");

    // --- Delete Account Selectors ---
    const deleteAccountLink = document.getElementById("delete-account-link");
    const deleteModal = document.getElementById("delete-confirmation");
    const confirmDeleteBtn = document.getElementById("confirm-delete-btn");
    const cancelDeleteBtn = document.getElementById("cancel-delete-btn");

    // --- Logout Selector ---
    const logoutLink = document.getElementById("logout-link");

    // Profile Modal Toggle
    if (editProfileLink && profileSection) {
        editProfileLink.addEventListener("click", (e) => {
            e.preventDefault();
            // Close other sections
            if (passwordSection) passwordSection.style.display = "none";
            
            document.getElementById("edit-fname").value = currentUser.fname || "";
            document.getElementById("edit-lname").value = currentUser.lname || "";
            document.getElementById("edit-email").value = currentUser.email || "";
            profileSection.style.display = "block";
            profileSection.scrollIntoView({ behavior: 'smooth' });
        });
    }

    if (closeProfileBtn) {
        closeProfileBtn.addEventListener("click", () => {
            profileSection.style.display = "none";
        });
    }

    // Password Section Toggle
    if (updatePasswordLink && passwordSection) {
        updatePasswordLink.addEventListener("click", (e) => {
            e.preventDefault();
            // Close other sections
            if (profileSection) profileSection.style.display = "none";
            
            passwordSection.style.display = "block";
            passwordSection.scrollIntoView({ behavior: 'smooth' });
        });
    }

    if (closeSecurityBtn) {
        closeSecurityBtn.addEventListener("click", () => {
            passwordSection.style.display = "none";
        });
    }

    // Delete Modal Toggle
    if (deleteAccountLink && deleteModal) {
        deleteAccountLink.addEventListener("click", (e) => {
            e.preventDefault();
            deleteModal.style.display = "flex"; 
        });
    }

    if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener("click", () => {
            deleteModal.style.display = "none";
        });
    }

    // Logout Logic
    if (logoutLink) {
        logoutLink.addEventListener("click", (e) => {
            e.preventDefault();
            if (confirm("Are you sure you want to logout?")) {
                sessionStorage.removeItem("currentUser");
                window.location.href = "index.html";
            }
        });
    }

    // Profile Update Logic
    if (profileForm) {
        profileForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const newEmail = document.getElementById("edit-email").value;
            const oldEmail = currentUser.email;

            // Migrate user-specific data keys on email change
            if (newEmail !== oldEmail) {
                const keys = ['savedPlaces', 'savedResults', 'savedItineraries'];
                keys.forEach(prefix => {
                    const data = localStorage.getItem(`${prefix}_${oldEmail}`);
                    if (data) {
                        localStorage.setItem(`${prefix}_${newEmail}`, data);
                        localStorage.removeItem(`${prefix}_${oldEmail}`);
                    }
                });
            }

            const accounts = JSON.parse(localStorage.getItem("accounts")) || [];
            const userIdx = accounts.findIndex(acc => acc.email === oldEmail);

            if (userIdx !== -1) {
                accounts[userIdx].fname = document.getElementById("edit-fname").value;
                accounts[userIdx].lname = document.getElementById("edit-lname").value;
                accounts[userIdx].email = newEmail;
                localStorage.setItem("accounts", JSON.stringify(accounts));
                
                currentUser.fname = accounts[userIdx].fname;
                currentUser.email = newEmail;
                sessionStorage.setItem("currentUser", JSON.stringify(currentUser));
                alert("Profile updated successfully!");
                location.reload();
            }
        });
    }

    // Delete Account Final Logic
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener("click", () => {
            const accounts = JSON.parse(localStorage.getItem("accounts")) || [];
            const filteredAccounts = accounts.filter(acc => acc.email !== currentUser.email);
            
            // Clear user-specific data
            const userKeys = [
                `savedPlaces_${currentUser.email}`, 
                `savedResults_${currentUser.email}`, 
                `savedItineraries_${currentUser.email}`
            ];
            userKeys.forEach(key => localStorage.removeItem(key));
            
            localStorage.setItem("accounts", JSON.stringify(filteredAccounts));
            sessionStorage.removeItem("currentUser");
            alert("Account deleted successfully.");
            window.location.href = "index.html";
        });
    }

    // Call display functions
    showSavedItineraries();
    showSavedResults();
    showSavedPlaces(); 
    showRecentSearches();
});

// --- DISPLAY LOGIC ---

// Helper to display saved itineraries with clickable functionality
function showSavedItineraries() {
    const container = document.getElementById("saved-itineraries-container");
    if (!container) return;

    const user = JSON.parse(sessionStorage.getItem("currentUser"));
    const storageKey = `savedItineraries_${user.email}`;
    const trips = JSON.parse(localStorage.getItem(storageKey)) || [];
    
    if (trips.length === 0) {
        container.innerHTML = `<p class="empty-state">No itineraries saved yet.</p>`;
        return;
    }

    const header = `<div class="section-header-row"><button class="remove-all-btn" onclick="removeAll('itineraries')">Remove All Itineraries</button></div>`;

    container.innerHTML = header + trips.map((trip, index) => `
        <div class="itinerary-card">
            <button class="remove-btn-top" onclick="removeItem('itineraries', ${index})">x</button>
            <div class="card-click-area" onclick="viewSavedItinerary(${index})">
                <div class="card-content-container">
                    <div class="card-badge">Itinerary</div>
                    <h3>${trip.destination}</h3>
                    <p class="card-dates">${trip.startDate} — ${trip.endDate}</p>
                    <span class="view-link">View Details →</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Function to handle saved results logic
function showSavedResults() {
    const container = document.getElementById("saved-results-container");
    if (!container) return;

    const user = JSON.parse(sessionStorage.getItem("currentUser"));
    const storageKey = `savedResults_${user.email}`;
    const results = JSON.parse(localStorage.getItem(storageKey)) || [];
    
    if (results.length === 0) {
        container.innerHTML = `<p class="empty-state">No saved results found.</p>`;
        return;
    }

    const header = `<div class="section-header-row"><button class="remove-all-btn" onclick="removeAll('results')">Remove All Results</button></div>`;

    container.innerHTML = header + results.map((trip, index) => `
        <div class="search-card">
            <button class="remove-btn-top" onclick="removeItem('results', ${index})">x</button>
            <div class="search-card-info" onclick="viewSavedResult(${index})">
                <div class="card-content-container">
                    <div class="card-badge">Trip Results</div>
                    <h3>${trip.destination}</h3>
                    <p class="card-dates">${trip.startDate} — ${trip.endDate}</p>
                    <span class="view-link">View Results →</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Helper to display individual curated places
function showSavedPlaces() {
    const container = document.getElementById("saved-places-container");
    if (!container) return;

    const user = JSON.parse(sessionStorage.getItem("currentUser"));
    const storageKey = `savedPlaces_${user.email}`;
    const savedPlaces = JSON.parse(localStorage.getItem(storageKey)) || [];

    if (savedPlaces.length === 0) {
        container.innerHTML = `<p class="empty-state">No saved places yet.</p>`;
        return;
    }

    const groupedByDest = savedPlaces.reduce((groups, place) => {
        const dest = place.destination || "Other";
        if (!groups[dest]) groups[dest] = [];
        groups[dest].push(place);
        return groups;
    }, {});

    container.innerHTML = Object.keys(groupedByDest).map(destinationName => `
        <section class="destination-section">
            <div class="destination-header-row">
                <h3 class="destination-header">${destinationName}</h3>
                <button class="remove-all-btn" onclick="removeAllFromCity('${destinationName.replace(/'/g, "\\'")}')">
                    Remove All
                </button>
            </div>
            <div class="places-horizontal-row">
                ${groupedByDest[destinationName].map(place => {
                    const idx = savedPlaces.findIndex(p => p.savedAt === place.savedAt);
                    return `
                        <div class="place-card">
                            <button class="remove-btn-top" onclick="removeItem('places', ${idx})">x</button>
                            ${place.photoUrl ? `<img src="${place.photoUrl}" class="place-card-img">` : ''}
                            <div class="place-card-info">
                                <h4>${place.displayName}</h4>
                                <p>${place.formattedAddress}</p>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </section>
    `).join('');
}

// Display recent searches
function showRecentSearches() {
    const container = document.getElementById("recent-searches-container");
    if (!container) return;

    const searches = JSON.parse(localStorage.getItem("recentSearches")) || [];

    if (searches.length === 0) {
        container.innerHTML = `<p class="empty-state">No searches performed yet.</p>`;
        return;
    }

    const header = `<div class="section-header-row"><button class="remove-all-btn" onclick="removeAll('recentSearches')">Clear History</button></div>`;

    container.innerHTML = header + searches.map((search, index) => `
        <div class="search-card">
            <button class="remove-btn-top" onclick="removeItem('recentSearches', ${index})">x</button>
            <div class="search-card-info">
                <h4>${search.destination}</h4>
                <p>${search.startDate} - ${search.endDate}</p>
            </div>
        </div>
    `).join('');
}

// --- REDIRECTION & REMOVAL ---

window.viewSavedItinerary = function(index) {
    const user = JSON.parse(sessionStorage.getItem("currentUser"));
    const trips = JSON.parse(localStorage.getItem(`savedItineraries_${user.email}`));
    sessionStorage.setItem("tripData", JSON.stringify(trips[index]));
    sessionStorage.setItem("itinerary", JSON.stringify(trips[index].details));
    window.location.href = "itinerary.html";
};

window.viewSavedResult = function(index) {
    const user = JSON.parse(sessionStorage.getItem("currentUser"));
    const results = JSON.parse(localStorage.getItem(`savedResults_${user.email}`));
    sessionStorage.setItem("tripData", JSON.stringify(results[index]));
    window.location.href = "results.html";
};

// Unified removal logic for single items
window.removeItem = function(type, index) {
    const user = JSON.parse(sessionStorage.getItem("currentUser"));
    const keyMap = {
        'places': `savedPlaces_${user.email}`,
        'itineraries': `savedItineraries_${user.email}`,
        'results': `savedResults_${user.email}`,
        'recentSearches': 'recentSearches'
    };
    const key = keyMap[type];
    const items = JSON.parse(localStorage.getItem(key)) || [];
    if (confirm(`Are you sure you want to remove this ${type}?`)) {
        items.splice(index, 1);
        localStorage.setItem(key, JSON.stringify(items));
        location.reload(); 
    }
};

// Logic to remove all items from a specific category
window.removeAll = function(type) {
    const user = JSON.parse(sessionStorage.getItem("currentUser"));
    const keyMap = {
        'itineraries': `savedItineraries_${user.email}`,
        'results': `savedResults_${user.email}`,
        'recentSearches': 'recentSearches'
    };
    const key = keyMap[type];
    if (confirm(`Are you sure you want to clear all ${type}?`)) {
        localStorage.removeItem(key);
        location.reload();
    }
};

// Logic to remove all places for a specific destination
window.removeAllFromCity = function(city) {
    const user = JSON.parse(sessionStorage.getItem("currentUser"));
    const key = `savedPlaces_${user.email}`;
    let savedPlaces = JSON.parse(localStorage.getItem(key)) || [];
    
    if (confirm(`Remove all saved places in ${city}?`)) {
        const filtered = savedPlaces.filter(place => place.destination !== city);
        localStorage.setItem(key, JSON.stringify(filtered));
        location.reload();
    }
};