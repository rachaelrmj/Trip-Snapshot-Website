document.addEventListener("DOMContentLoaded", () => {
    // Check if a user is currently logged into this tab/session
    const sessionData = sessionStorage.getItem("currentUser");
    // Get account data (even if empty) and store in the accounts variable
    const accounts = JSON.parse(localStorage.getItem("accounts")) || [];

    // Check if session data does not exist....
    if (!sessionData) {
        // Redirect user to the login page
        window.location.href = "login.html";
        // Stop further code execution
        return;
    }

    // Assign current user session to the currentUser variable
    const currentUser = JSON.parse(sessionData);

    // Verify that this user exists in the permanent account list and convert all letters to lowercase
    const accountExists = accounts.some(acc => acc.email.toLowerCase() === currentUser.email.toLowerCase());

    // If no account exists....
    if (!accountExists) {
        // Clear session storage
        sessionStorage.removeItem("currentUser");
        // Redirect to signup page
        window.location.href = "signup.html";
        // Stop further code execution
        return;
    }

    // Get the header element for profile overview and store data in the welcomeHeader variable
    const welcomeHeader = document.querySelector("#profile-overview h2");

    // If there is a welcome header...
    if (welcomeHeader) {
        // Store either the first name or email address of current user in the name variable
        const name = currentUser.fname || currentUser.email.split('@')[0];
        // Update h2 element content to reflect either the user's first name or email address, if first name is not given
        welcomeHeader.textContent = `Welcome, ${name}!`;
    }

    // Profile Settings Elements & Variables
    const editProfileLink = document.getElementById("edit-profile-link");
    const profileSection = document.getElementById("profile-settings");
    const profileForm = document.getElementById("profile-update-form");
    const closeProfileBtn = document.getElementById("close-profile-btn");

    // Password Settings Elements & Variables
    const updatePasswordLink = document.getElementById("updatePassword-link");
    const passwordSection = document.getElementById("password-update");
    const passwordForm = document.getElementById("password-update-form");
    const closeSecurityBtn = document.getElementById("close-security-btn");

    // Delete Account Elements & Variables
    const deleteAccountLink = document.getElementById("delete-account-link");
    const deleteModal = document.getElementById("delete-confirmation");
    const confirmDeleteBtn = document.getElementById("confirm-delete-btn");
    const cancelDeleteBtn = document.getElementById("cancel-delete-btn");

    // Logout Element and Variable
    const logoutLink = document.getElementById("logout-link");

    // Profile Modal (Pop-up) Toggle
    if (editProfileLink && profileSection) {
        editProfileLink.addEventListener("click", (e) => {
            // Prevent default form behavior
            e.preventDefault();
            // Close other sections
            if (passwordSection) passwordSection.style.display = "none";
            
            // Auto-populate current user's information in associated fields. If no value exists, display empty
            document.getElementById("edit-fname").value = currentUser.fname || "";
            document.getElementById("edit-lname").value = currentUser.lname || "";
            document.getElementById("edit-email").value = currentUser.email || "";
            // Display profile section in block style and allow smooth scrolling
            profileSection.style.display = "block";
            profileSection.scrollIntoView({ 
                behavior: 'smooth' 
            });
        });
    }

    // Close profile Modal (Pop-up) if close button is clicked
    if (closeProfileBtn) {
        closeProfileBtn.addEventListener("click", () => {
            profileSection.style.display = "none";
        });
    }

    // If update password button is clicked and profile screen displays...
    if (updatePasswordLink && passwordSection) {
        updatePasswordLink.addEventListener("click", (e) => {
            // Prevent default form behavior
            e.preventDefault();
            // Close profile section if open 
            if (profileSection) profileSection.style.display = "none";
            
            // Display password section in block style 
            passwordSection.style.display = "block";
            // Allow smooth scrolling
            passwordSection.scrollIntoView({ 
                behavior: 'smooth' 
            });
        });
    }

    // Close security Modal (Pop-up) if close button is clicked
    if (closeSecurityBtn) {
        closeSecurityBtn.addEventListener("click", () => {
            // Close password Modal (pop-up)
            passwordSection.style.display = "none";
        });
    }

    // If delete account button is clicked...
    if (deleteAccountLink && deleteModal) {
        deleteAccountLink.addEventListener("click", (e) => {
            // Prevent default form behavior
            e.preventDefault();
            // Display delete Modal (Pop-up) in flex display
            deleteModal.style.display = "flex"; 
        });
    }

    // If cancel button is click...
    if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener("click", () => {
            // Close delete Modal (pop-up)
            deleteModal.style.display = "none";
        });
    }

    // If logout button is clicked... 
    if (logoutLink) {
        logoutLink.addEventListener("click", (e) => {
            // Prevent default form behavior
            e.preventDefault();
            // Confirm user wants to logout
            if (confirm("Are you sure you want to logout?")) {
                // If so, log-out/clear user from session storage
                sessionStorage.removeItem("currentUser");
                // Redirect user to homepage
                window.location.href = "index.html";
            }
        });
    }

    // If profile form submit button is clicked....
    if (profileForm) {
        profileForm.addEventListener("submit", (e) => {
            // Prevent default form behavior
            e.preventDefault();
            // Assign updated email value to the newEmail variable
            const newEmail = document.getElementById("edit-email").value;
            // Assign old email to the oldEmail variable
            const oldEmail = currentUser.email;

            // If new email is not the same as old email....
            if (newEmail !== oldEmail) {
                // Store data from savedPlaces, savedResults and savedItineraries in the keys variable
                const keys = ['savedPlaces', 'savedResults', 'savedItineraries'];
                keys.forEach(prefix => {
                    // 
                    const data = localStorage.getItem(`${prefix}_${oldEmail}`);
                    if (data) {
                        localStorage.setItem(`${prefix}_${newEmail}`, data);
                        localStorage.removeItem(`${prefix}_${oldEmail}`);
                    }
                });
            }

            // Get accounts data (even if empty) and store in the accounts variable
            const accounts = JSON.parse(localStorage.getItem("accounts")) || [];
            //
            const userIndex = accounts.findIndex(acc => acc.email === oldEmail);

            if (userIndex !== -1) {
                accounts[userIndex].fname = document.getElementById("edit-fname").value;
                accounts[userIndex].lname = document.getElementById("edit-lname").value;
                accounts[userIndex].email = newEmail;
                localStorage.setItem("accounts", JSON.stringify(accounts));
                
                currentUser.fname = accounts[userIndex].fname;
                currentUser.email = newEmail;
                sessionStorage.setItem("currentUser", JSON.stringify(currentUser));
                // Inform user their profile was successfully updated
                alert("Profile updated successfully!");
                // Reload the page
                location.reload();
            }
        });
    }

    // If delete confirmation button is clicked....
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener("click", () => {
            // Get account data from local storage (even if empty) and store in the accounts variable
            const accounts = JSON.parse(localStorage.getItem("accounts")) || [];
            // Search through accounts array in local storage and filter all other accounts besides current user and store data in the filteredAccounts variable
            const filteredAccounts = accounts.filter(acc => acc.email !== currentUser.email);
            
            // Store current user's saved trip data (based on email) in the userKeys variable
            const userKeys = [
                `savedPlaces_${currentUser.email}`, 
                `savedResults_${currentUser.email}`, 
                `savedItineraries_${currentUser.email}`
            ];
            // Removed each key within the userKeys variable from local storage
            userKeys.forEach(key => localStorage.removeItem(key));
            // Reset local storage with remain accounts that exist, without the deleted account
            localStorage.setItem("accounts", JSON.stringify(filteredAccounts));
            // Remove current user session data from session storage
            sessionStorage.removeItem("currentUser");
            // User confirmation account was deleted successfully
            alert("Account deleted successfully.");
            // Redirect user to homepage
            window.location.href = "index.html";
        });
    }

    // Call display functions
    showSavedItineraries();
    showSavedResults();
    showSavedPlaces(); 
    showRecentSearches();
});


// Display saved itineraries
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
                    <span class="view-link">View Itinerary →</span>
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

function showSavedPlaces() {
    const container = document.getElementById("saved-places-container");
    if (!container) return;

    const user = JSON.parse(sessionStorage.getItem("currentUser"));
    if (!user) {
        container.innerHTML = `<p class="empty-state">Sign in to view saved places.</p>`;
        return;
    }

    const storageKey = `savedPlaces_${user.email}`;
    const savedPlaces = JSON.parse(localStorage.getItem(storageKey)) || [];

    if (savedPlaces.length === 0) {
        container.innerHTML = `<p class="empty-state">No saved places yet.</p>`;
        return;
    }

    const savedPlacesWithIndex = savedPlaces.map((place, index) => ({
        ...place,
        originalIndex: index
    }));

    const groupedByDest = savedPlacesWithIndex.reduce((groups, place) => {
        const dest = (typeof place.destination === "string" && place.destination.trim() !== "")
            ? place.destination
            : "Other";

        if (!groups[dest]) groups[dest] = [];
        groups[dest].push(place);
        return groups;
    }, {});

    container.innerHTML = Object.keys(groupedByDest).map(destinationName => `
        <section class="destination-section">
            <div class="destination-header-row">
                <h3 class="destination-header">${destinationName}</h3>
                <button class="remove-all-btn" onclick="removeAllFromCity('${destinationName.replace(/'/g, "\\'")}')"> Remove All </button>
            </div>
            <div class="places-horizontal-row">
                ${groupedByDest[destinationName].map(place => {
                    const imgSrc = (place.photoUrl || place.photo) && (place.photoUrl || place.photo) !== "Not Available"
                        ? (place.photoUrl || place.photo)
                        : "images/results-page/no-photo.svg";

                    return `
                        <div class="place-card">
                            <button class="remove-btn-top" onclick="removeItem('places', ${place.originalIndex})">x</button>

                            <img src="${imgSrc}" class="place-card-img" alt="${place.displayName}">

                            <div class="place-card-info">
                                <h4>${place.displayName}</h4>
                                <p>${place.formattedAddress || place.address || "Address not available"}</p>
                                <a href="${place.websiteURI}" target="_blank" rel="noopener" class="website-link"> Visit Website <span class="sr-only">for ${place.displayName}</span></a>
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

window.viewSavedItinerary = function(index) {
    const user = JSON.parse(sessionStorage.getItem("currentUser"));
    const trips = JSON.parse(localStorage.getItem(`savedItineraries_${user.email}`));

    sessionStorage.setItem("tripData", JSON.stringify(trips[index]));
    sessionStorage.setItem("itinerary", JSON.stringify(trips[index].details));

    sessionStorage.removeItem("results");

    window.location.href = "itinerary.html";
};

window.viewSavedResult = function(index) {
    const user = JSON.parse(sessionStorage.getItem("currentUser"));
    const results = JSON.parse(localStorage.getItem(`savedResults_${user.email}`));

    sessionStorage.setItem("tripData", JSON.stringify(results[index]));

    sessionStorage.removeItem("itinerary");

    window.location.href = "results.html";
};

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