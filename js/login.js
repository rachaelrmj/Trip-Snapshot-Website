document.addEventListener("DOMContentLoaded", function () {
    // Get HTML elements from DOM and store in variables
    const loginForm = document.getElementById("login-form");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");

    const loginPopup = document.getElementById("login-confirmation");
    const loginErrorPopup = document.getElementById("login-error");
    const noAccountPopup = document.getElementById("no-account");

    const forgotPasswordLink = document.getElementById("forgot-password-link");
    const recoveryPopup = document.getElementById("recovery-popup");
    const recoveryForm = document.getElementById("recovery-form");

    const closeButtons = document.querySelectorAll(".close-popup, .acknowledge-popup");

    // Display popup and optionally store redirect url
    function showPopup(modal, redirectUrl = null) {
        if (!modal) return;
        modal.style.display = "flex";
        if (redirectUrl) modal.dataset.redirect = redirectUrl;
    }

    // Handle closing popups and optional redirect
    closeButtons.forEach(button => {
        button.addEventListener("click", function () {
            const modal = this.closest(".popup-window");
            modal.style.display = "none";
            if (modal.dataset.redirect) window.location.href = modal.dataset.redirect;
        });
    });

    // Open password recovery popup
    if (forgotPasswordLink && recoveryPopup) {
        forgotPasswordLink.addEventListener("click", function (e) {
            e.preventDefault();
            // Display pop-up
            showPopup(recoveryPopup);
        });
    }

    // Handle Password Recovery Submission
    if (recoveryForm) {
        recoveryForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const recoveryEmail = document.getElementById("recovery-email").value.trim();
            const accounts = JSON.parse(localStorage.getItem("accounts")) || [];

            // Check if the email exists in the system
            const accountExists = accounts.some(acc => acc.email.toLowerCase() === recoveryEmail.toLowerCase());

            // If account exists...
            if (accountExists) {
                // Display message to user, an email has been sent with password reset instructions
                alert(`An email has been sent to ${recoveryEmail} with instructions on how to reset your password.`);
                // Close pop-up
                recoveryPopup.style.display = "none";
                // Reset the form
                recoveryForm.reset();
                // Display message to user, email address does not exist
            } else {
                alert("No account found with that email address. Please check your spelling or sign up for a new account.");
            }
        });
    }

    // Handle login form submission
    if (loginForm) {
        loginForm.addEventListener("submit", function (event) {
            // Prevent default form behavior
            event.preventDefault();
            // Trim white space from email input by user and store in the email variable
            const email = emailInput.value.trim();
            // Trim white space from password input by user and store in the password variable
            const password = passwordInput.value.trim();

            const accounts = JSON.parse(localStorage.getItem("accounts")) || [];
            // Find account by email (case-insensitive) and store in the account variable
            const account = accounts.find(acc => acc.email.toLowerCase() === email.toLowerCase());

            // If no account is found...
            if (!account) {
                // Show message and redirect to signup
                showPopup(noAccountPopup, "signup.html");
                // Stop further code execution
                return;
            }

            // If password matches account password stored in local storage....
            if (account.password === password) {
                // Store active session user / Log user in
                sessionStorage.setItem("currentUser", JSON.stringify(account));
                // Show login successful confirmation popup and redirect to profile page
                showPopup(loginPopup, "profile.html");
            } else {
                // Show incorrect password popup
                showPopup(loginErrorPopup);
            }
        });
    }
});