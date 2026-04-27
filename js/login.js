document.addEventListener("DOMContentLoaded", function () {
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

    // Handle Forgot Password link click
    if (forgotPasswordLink && recoveryPopup) {
        forgotPasswordLink.addEventListener("click", function (e) {
            e.preventDefault();
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

            if (accountExists) {
                alert(`An email has been sent to ${recoveryEmail} with instructions on how to reset your password.`);
                recoveryPopup.style.display = "none";
                recoveryForm.reset();
            } else {
                alert("No account found with that email address. Please check your spelling or sign up for a new account.");
            }
        });
    }

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
            sessionStorage.setItem("currentUser", JSON.stringify(account));
            showPopup(loginPopup, "profile.html");
        } else {
            showPopup(loginErrorPopup);
        }
    });
});