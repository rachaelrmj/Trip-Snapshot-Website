document.addEventListener("DOMContentLoaded", () => {
    // Check if a user is currently logged into this tab/session
    const sessionData = sessionStorage.getItem("currentUser");
    
    if (!sessionData) {
        // No session found; redirect to signup as the primary gatekeeper
        window.location.href = "signup.html";
        return;
    }

    let currentUser = JSON.parse(sessionData);

    const welcomeHeader = document.querySelector("#profile-overview h2");

    // Display the first name captured during signup, falling back to email prefix if necessary
    if (welcomeHeader) {
        const name = currentUser.fname || currentUser.email.split('@')[0];
        welcomeHeader.textContent = `Welcome, ${name}!`;
    }

    const editProfileLink = document.getElementById("edit-profile-link");
    const profileSection = document.getElementById("profile-settings");
    const closeProfileBtn = document.getElementById("close-profile-btn");
    const profileForm = document.getElementById("profile-update-form");

    // Autofill and Toggle
    if (editProfileLink && profileSection) {
        editProfileLink.addEventListener("click", (e) => {
            e.preventDefault();
            
            // Autofill current data
            document.getElementById("edit-fname").value = currentUser.fname || "";
            document.getElementById("edit-lname").value = currentUser.lname || "";
            document.getElementById("edit-email").value = currentUser.email || "";

            profileSection.style.display = "block";
            profileSection.scrollIntoView({ behavior: 'smooth' });
        });
    }

    // Profile Update Logic
    if (profileForm) {
        profileForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const newFname = document.getElementById("edit-fname").value;
            const newLname = document.getElementById("edit-lname").value;
            const newEmail = document.getElementById("edit-email").value;
            const oldEmail = currentUser.email;
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            // Validation: Email Format
            if (!emailRegex.test(newEmail)) {
                alert("Error: Please enter a valid email format.");
                return;
            }

            // Move saved places to the new email key if email was updated
            if (newEmail !== oldEmail) {
                const oldKey = `savedPlaces_${oldEmail}`;
                const newKey = `savedPlaces_${newEmail}`;
                const data = localStorage.getItem(oldKey);
                if (data) {
                    localStorage.setItem(newKey, data);
                    localStorage.removeItem(oldKey);
                }
            }

            // Access the permanent account list to handle update
            const accounts = JSON.parse(localStorage.getItem("accounts")) || [];
            const userIdx = accounts.findIndex(acc => acc.email === oldEmail);

            if (userIdx !== -1) {
                // Overwrite data in accounts array
                accounts[userIdx].fname = newFname;
                accounts[userIdx].lname = newLname;
                accounts[userIdx].email = newEmail;

                try {
                    localStorage.setItem("accounts", JSON.stringify(accounts));
                    
                    // Update Session Storage to keep UI in sync
                    currentUser.fname = newFname;
                    currentUser.lname = newLname;
                    currentUser.email = newEmail;
                    sessionStorage.setItem("currentUser", JSON.stringify(currentUser));

                    alert("Profile updated successfully!");

                    // Logic for Email Change Redirect
                    if (newEmail !== oldEmail) {
                        if (confirm("You updated your email. Would you also like to change your password for security?")) {
                            profileSection.style.display = "none";
                            securitySection.style.display = "block"; 
                            return;
                        }
                    }
                    profileSection.style.display = "none";
                    location.reload(); // Refresh to show new name in welcome header
                } catch (err) {
                    alert("Error saving data. Local storage may be full.");
                }
            }
        });
    }

    // Show/Hide Password Toggle Logic
    document.querySelectorAll(".toggle-password").forEach(button => {
        button.addEventListener("click", function() {
            const targetId = this.getAttribute("data-target");
            const input = document.getElementById(targetId);
            
            if (input.type === "password") {
                input.type = "text";
                this.textContent = "Hide";
            } else {
                input.type = "password";
                this.textContent = "Show";
            }
        });
    });

    if (closeProfileBtn) {
        closeProfileBtn.addEventListener("click", () => {
            profileSection.style.display = "none";
        });
    }

    const securityLink = document.getElementById("updatePassword-link");
    const securitySection = document.getElementById("password-update");
    const closeSecurityBtn = document.getElementById("close-security-btn");
    const passwordForm = document.getElementById("password-update-form");

    // Toggle visibility
    if (securityLink && securitySection) {
        securityLink.addEventListener("click", (e) => {
            e.preventDefault();
            securitySection.style.display = "block";
            securitySection.scrollIntoView({ behavior: 'smooth' });
        });
    }

    if (closeSecurityBtn) {
        closeSecurityBtn.addEventListener("click", () => {
            securitySection.style.display = "none";
        });
    }

    // Handle Password Update
    if (passwordForm) {
        passwordForm.addEventListener("submit", (e) => {
            e.preventDefault();
            
            const currentPassInput = document.getElementById("current-password").value;
            const newPassInput = document.getElementById("new-password").value;

            const accounts = JSON.parse(localStorage.getItem("accounts")) || [];
            const userIdx = accounts.findIndex(acc => acc.email === currentUser.email);

            if (userIdx !== -1) {
                // Check if current password matches what's on file
                if (accounts[userIdx].password === currentPassInput) {
                    // Update password
                    accounts[userIdx].password = newPassInput;
                    localStorage.setItem("accounts", JSON.stringify(accounts));
                    
                    alert("Password updated! Please use your new password next time you log in.");
                    securitySection.style.display = "none";
                    passwordForm.reset();
                } else {
                    alert("Verification failed: Current password is incorrect.");
                }
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

    // If user clicks delete account button...
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener("click", () => {
            const userEmail = currentUser.email;

            // Remove the user from the localStorage
            const allAccounts = JSON.parse(localStorage.getItem("accounts")) || [];
            const filteredAccounts = allAccounts.filter(acc => acc.email !== userEmail);
            localStorage.setItem("accounts", JSON.stringify(filteredAccounts));

            // Remove savedPlaces data from local storage
            localStorage.removeItem(`savedPlaces_${userEmail}`);

            // Remove itineraries from local storage
            localStorage.removeItem("itineraries");
            // Remove recentSearches from local storage
            localStorage.removeItem("recentSearches");

            // Remove the current session storage
            sessionStorage.removeItem("currentUser");

            // Redirect to home page after account is deleted
            window.location.href = "index.html";
        });
    }

    // Manually ends the session, clearing data from sessionStorage while retaining data in localStorage
    const logoutBtn = document.getElementById("logout-link");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();

            // Clear the current session from storage
            sessionStorage.removeItem("currentUser");

            // Clear all session storage if you want a total reset
            sessionStorage.clear();

            // Redirect to ensure the session state is refreshed
            window.location.href = "index.html";
        });
    }

    const btn = document.getElementById("theme-toggle");
    if (btn) {
        // Load saved mode
        if (localStorage.getItem("theme") === "dark") {
            document.body.classList.add("dark-mode");
        }

        // Toggle
        btn.addEventListener("click", () => {
            document.body.classList.toggle("dark-mode");
            const isDark = document.body.classList.contains("dark-mode");
            localStorage.setItem("theme", isDark ? "dark" : "light");
        });
    }

    // Call functions
    showSavedItineraries();
    showRecentSearches();
    showSavedPlaces(); 
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

    // Clear and render cards, only rendering images if photoUrl exists to prevent 404s
    container.innerHTML = trips.map((trip, index) => {
        const imgTag = trip.photoUrl ? `<img src="${trip.photoUrl}" class="card-hero-img" alt="${trip.destination}">` : '';

        return `
            <div class="itinerary-card">
                <button class="remove-btn-top" onclick="removeItem('itineraries', ${index})">x</button>
                <div class="card-click-area" onclick="viewItinerary(${index})">
                    ${imgTag}
                    <div class="card-content-wrapper">
                        <div class="card-badge">Trip Snapshot</div>
                        <h3>${trip.destination}</h3>
                        <p class="card-dates">${trip.startDate} — ${trip.endDate}</p>
                        <span class="view-link">View Details →</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Redirect logic to allow viewing itinerary details from the card
window.viewItinerary = function(index) {
    const trips = JSON.parse(localStorage.getItem("itineraries")) || [];
    sessionStorage.setItem("tripData", JSON.stringify(trips[index]));
    window.location.href = "itinerary.html";
};

// Helper to display individual curated places
function showSavedPlaces() {
    const container = document.getElementById("saved-places-container");
    if (!container) return;

    const user = JSON.parse(sessionStorage.getItem("currentUser"));
    if (!user) return;

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
                    const idx = savedPlaces.findIndex(p => 
                    p.savedAt === place.savedAt
                    );

                    return `
                        <div class="place-card">
                            <button class="remove-btn-top" onclick="removeItem('places', ${idx})">x</button>

                            ${place.photoUrl ? `<img src="${place.photoUrl}" class="place-card-img">` : ''}

                            <div class="place-card-info">
                                <h4>${place.displayName}</h4>
                                <p>${place.formattedAddress}</p>
                                ${place.websiteURI ? `<a href="${place.websiteURI}" target="_blank" class="website-link">Visit Website</a>` : ''}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </section>
    `).join('');
}

// Logic to remove all places for a specific destination
window.removeAllFromCity = function(cityName) {
    if (confirm(`Are you sure you want to remove all saved places in ${cityName}?`)) {
        const user = JSON.parse(sessionStorage.getItem("currentUser"));
        const storageKey = `savedPlaces_${user.email}`;
        let savedPlaces = JSON.parse(localStorage.getItem(storageKey)) || [];
        
        // Filter out all places matching this city
        const filtered = savedPlaces.filter(p => p.destination !== cityName);
        localStorage.setItem(storageKey, JSON.stringify(filtered));
        
        // Refresh the UI
        showSavedPlaces();
    }
};

// Display recent searches
function showRecentSearches() {
    const container = document.getElementById("recent-searches-container");
    if (!container) return;

    const searches = JSON.parse(localStorage.getItem("recentSearches")) || [];
    
    if (searches.length === 0) {
        container.innerHTML = `<p class="empty-state">No recent searches found. <a href="index.html">Search a trip now!</a></p>`;
        return;
    }

    container.innerHTML = searches.map((search, index) => {
        // Display image tag only if valid URL exists to avoid 404 errors
        const imgTag = search.photoUrl ? `<img src="${search.photoUrl}" class="search-card-img" alt="${search.destination}">` : '';

        return `
            <div class="search-card">
                <button class="remove-btn-top" onclick="removeItem('recentSearches', ${index})">x</button>
                ${imgTag}
                <div class="search-card-info">
                    <h4>${search.destination}</h4>
                    <p>${search.startDate} - ${search.endDate}</p>
                    <small>Searched on: ${search.timestamp}</small>
                </div>
            </div>
        `;
    }).join('');
}

// Unified removal logic with clean grammatical labels for confirmation
window.removeItem = function(type, index) {
    const user = JSON.parse(sessionStorage.getItem("currentUser"));
    const key = type === 'places' ? `savedPlaces_${user.email}` : type;
    
    let displayLabel = 'place';
    if (type === 'recentSearches') displayLabel = 'recent search';
    if (type === 'itineraries') displayLabel = 'itinerary';
    
    let items = JSON.parse(localStorage.getItem(key)) || [];
    if (confirm(`Are you sure you want to remove this ${displayLabel}?`)) {
        items.splice(index, 1);
        localStorage.setItem(key, JSON.stringify(items));
        location.reload(); 
    }
};