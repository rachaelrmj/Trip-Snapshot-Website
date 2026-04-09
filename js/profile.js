// profile.js
document.addEventListener("DOMContentLoaded", () => {
    renderRecentSearches();
    renderSavedItineraries();
});

function renderRecentSearches() {
    const container = document.getElementById("recent-searches-container");
    const searches = JSON.parse(localStorage.getItem("recentSearches")) || [];

    if (searches.length === 0) {
        container.innerHTML = "<p>No recent searches found.</p>";
        return;
    }

    container.innerHTML = searches.map(s => `
        <div class="search-card">
            <h4>${s.destination}</h4>
            <p>${s.dates}</p>
        </div>
    `).join("");
}

function renderSavedItineraries() {
    const container = document.getElementById("saved-itineraries-container");
    const saved = JSON.parse(localStorage.getItem("savedItineraries")) || [];

    if (saved.length === 0) {
        container.innerHTML = "<p>You haven't saved any trips yet.</p>";
        return;
    }

    container.innerHTML = saved.map((trip, index) => `
        <div class="itinerary-card">
            <h3>${trip.destination}</h3>
            <p>${trip.dates}</p>
            <button onclick="viewSavedTrip(${index})">View Itinerary</button>
        </div>
    `).join("");
}

// Helper to reload a saved trip into the main viewer
window.viewSavedTrip = (index) => {
    const saved = JSON.parse(localStorage.getItem("savedItineraries"));
    localStorage.setItem("tripData", JSON.stringify(saved[index]));
    window.location.href = "itinerary.html";
};