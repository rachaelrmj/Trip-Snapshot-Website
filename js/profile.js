document.addEventListener("DOMContentLoaded", () => {
    // 1. Session Authorization
    // Check if a user is currently logged into this tab/session.
    const sessionData = sessionStorage.getItem("currentUser");
    
    if (!sessionData) {
        // No session found; redirect to signup as the primary gatekeeper.
        window.location.href = "signup.html";
        return;
    }

    const currentUser = JSON.parse(sessionData);
    const profileImg = document.getElementById("profile-image");
    const imageInput = document.getElementById("image-upload");
    const welcomeHeader = document.querySelector("#profile-overview h2");

    // 2. Load Permanent Database Records
    // Access the permanent account list to retrieve stored photos and handle deletion.
    const allAccounts = JSON.parse(localStorage.getItem("accounts")) || [];
    const activeAccount = allAccounts.find(acc => acc.email === currentUser.email);

    // 3. UI Personalization
    // Display the first name captured during signup, falling back to email prefix if necessary.
    if (welcomeHeader) {
        const name = currentUser.fname || currentUser.email.split('@')[0];
        welcomeHeader.textContent = `Welcome, ${name}!`;
    }

    // Apply the saved profile picture from the account database if it exists.
    if (activeAccount && activeAccount.profilePic) {
        profileImg.src = activeAccount.profilePic;
    }

    // 4. Profile Image Upload Logic
    if (imageInput) {
        imageInput.addEventListener("change", function(event) {
            const selectedFile = event.target.files[0];
            if (selectedFile) {
                const fileReader = new FileReader();
                
                fileReader.onload = function(e) {
                    const base64Data = e.target.result;
                    
                    // Update current view immediately.
                    profileImg.src = base64Data;

                    // Update the permanent localStorage account list.
                    const updatedList = allAccounts.map(acc => {
                        if (acc.email === currentUser.email) {
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

    // 5. Account Deletion Logic
    const deleteLink = document.getElementById("delete-account-link");
    const deletePopup = document.getElementById("delete-confirmation");
    const confirmDeleteBtn = document.getElementById("confirm-delete-btn");
    const cancelDeleteBtn = document.getElementById("cancel-delete-btn");

    // Open the confirmation popup.
    if (deleteLink) {
        deleteLink.addEventListener("click", (e) => {
            e.preventDefault();
            deletePopup.style.display = "flex";
        });
    }

    // Close popup if user cancels.
    if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener("click", () => {
            deletePopup.style.display = "none";
        });
    }

    // Execute permanent removal of the account.
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener("click", () => {
            // Remove the user from the permanent localStorage database.
            const filteredAccounts = allAccounts.filter(acc => acc.email !== currentUser.email);
            localStorage.setItem("accounts", JSON.stringify(filteredAccounts));

            // Clear the current session storage.
            sessionStorage.removeItem("currentUser");

            // Redirect to home page after account is wiped.
            window.location.href = "index.html";
        });
    }

    // 6. Logout Logic
    // Manually ends the session without deleting permanent account data.
    const logoutBtn = document.getElementById("logout-link");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            sessionStorage.removeItem("currentUser");
            window.location.href = "index.html";
        });
    }

    // 7. Data Rendering Placeholders
    // These functions can be expanded to display itineraries or searches.
    renderSavedItineraries();
});

/**
 * Helper to display saved itineraries.
 */
function renderSavedItineraries() {
    const container = document.getElementById("saved-itineraries-container");
    if (!container) return;

    const trips = JSON.parse(localStorage.getItem("itineraries")) || [];
    
    if (trips.length === 0) {
        container.innerHTML = `<p>No itineraries saved yet. <a href="planner.html">Start planning Now!</a></p>`;
    } else {
        // Map data to HTML cards as needed for your prototype.
        container.innerHTML = trips.map(trip => `
            <div class="itinerary-card">
                <h3>${trip.destination}</h3>
                <p>${trip.startDate} to ${trip.endDate}</p>
            </div>
        `).join('');
    }
}