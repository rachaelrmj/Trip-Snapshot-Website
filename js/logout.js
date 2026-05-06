document.addEventListener("DOMContentLoaded", () => {
    const logoutLink = document.getElementById("logout-link");
    const sessionUser = sessionStorage.getItem("currentUser");

    if (logoutLink && sessionUser) {
        logoutLink.style.display = "inline";
    }
});