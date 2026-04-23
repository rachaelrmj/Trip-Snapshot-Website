document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("login-form");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");

    const loginPopup = document.getElementById("login-confirmation");
    const loginErrorPopup = document.getElementById("login-error");
    const noAccountPopup = document.getElementById("no-account");

    const closeButtons = document.querySelectorAll(".close-popup, .acknowledge-popup");

    function showPopup(modal, redirectUrl = null) {
        modal.style.display = "flex";
        if (redirectUrl) modal.dataset.redirect = redirectUrl;
    }

    closeButtons.forEach(button => {
        button.addEventListener("click", function () {
            const modal = this.closest(".popup-window");
            modal.style.display = "none";
            if (modal.dataset.redirect) window.location.href = modal.dataset.redirect;
        });
    });

    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        const accounts = JSON.parse(localStorage.getItem("accounts")) || [];
        const account = accounts.find(acc => acc.email.toLowerCase() === email.toLowerCase());

        if (!account) {
            // No account found: Show popup then redirect to signup
            showPopup(noAccountPopup, "signup.html");
            return;
        }

        if (account.password === password) {
            // CRITICAL: Use sessionStorage for current session only
            sessionStorage.setItem("currentUser", JSON.stringify(account));
            showPopup(loginPopup, "profile.html");
        } else {
            showPopup(loginErrorPopup);
        }
    });
});