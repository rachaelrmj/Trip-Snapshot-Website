document.addEventListener("DOMContentLoaded", () => {

    const menuToggle = document.getElementById("menu-toggle");
    const tripBanner = document.getElementById("trip-summary-bar");
    const header = document.querySelector("header");

    if (!menuToggle || !tripBanner || !header) return;

    function updateBannerPosition() {
        let headerHeight = header.offsetHeight;

        // If mobile menu is open, add mobile nav height
        if (menuToggle.checked) {
            const mobileNav = document.querySelector(".mobile-nav");
            if (mobileNav) {
                headerHeight += mobileNav.offsetHeight;
            }
        }

        tripBanner.style.top = headerHeight + "px";
    }

    // Run when menu toggles
    menuToggle.addEventListener("change", updateBannerPosition);

    // Run on resize (optional)
    window.addEventListener("resize", updateBannerPosition);

    // Initialize on load
    updateBannerPosition();
});