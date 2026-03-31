document.addEventListener("DOMContentLoaded", function () {

    const loginForm = document.getElementById("login-form");
    const emailInput = document.getElementById("email"); // fixed ID
    const passwordInput = document.getElementById("password");

    // Popups
    const loginPopup = document.getElementById("login-confirmation"); // fixed ID
    const loginErrorPopup = document.getElementById("login-error");
    const forgotPopup = document.getElementById("forgot-popup");
    const noAccountPopup = document.getElementById("no-account");

    const closeButtons = document.querySelectorAll(".close-popup, .acknowledge-popup");

    let lastFocusedElement;

    /** Utility: Show popup */
    function showPopup(modal) {
        lastFocusedElement = document.activeElement;
        modal.style.display = "flex";
        modal.setAttribute("aria-hidden", "false");
        trapFocus(modal);
    }

    /** Utility: Hide popup */
    function hidePopup(modal) {
        modal.style.display = "none";
        modal.setAttribute("aria-hidden", "true");
        if (lastFocusedElement) lastFocusedElement.focus();
    }

    /** Focus trap for accessibility */
    function trapFocus(modal) {
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusableElements.length) return;

        const firstEl = focusableElements[0];
        const lastEl = focusableElements[focusableElements.length - 1];

        firstEl.focus();

        function handleKeydown(e) {
            if (e.key === "Tab") {
                if (e.shiftKey) {
                    if (document.activeElement === firstEl) {
                        e.preventDefault();
                        lastEl.focus();
                    }
                } else {
                    if (document.activeElement === lastEl) {
                        e.preventDefault();
                        firstEl.focus();
                    }
                }
            }
            if (e.key === "Escape") {
                hidePopup(modal);
            }
        }

        modal.addEventListener("keydown", handleKeydown);

        modal.addEventListener("transitionend", () => {
            if (modal.style.display === "none") {
                modal.removeEventListener("keydown", handleKeydown);
            }
        });
    }

    /** Close popup buttons */
    closeButtons.forEach(button => {
        button.addEventListener("click", function () {
            const modal = this.closest(".popup-window");
            hidePopup(modal);

            // Redirect if needed
            if (modal === loginPopup) window.location.href = "profile.html";
            if (modal === noAccountPopup) window.location.href = "signup.html";
        });
    });

    /** Load accounts from localStorage */
    function loadAccounts() {
        return JSON.parse(localStorage.getItem("accounts")) || [];
    }

    /** Form submission */
    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!email || !password) {
            showPopup(loginErrorPopup);
            return;
        }

        const accounts = loadAccounts();
        const account = accounts.find(acc => acc.email === email);

        if (!account) {
            showPopup(noAccountPopup);
            return;
        }

        if (account.password === password) {
            showPopup(loginPopup);
        } else {
            showPopup(loginErrorPopup);
        }
    });

    /** Forgot password flow */
    const forgotLink = document.getElementById("forgot-password"); // fixed ID
    const forgotClose = document.getElementById("forgot-close");
    const forgotSubmit = document.getElementById("forgot-submit");
    const forgotEmailInput = document.getElementById("forgot-email");
    const forgotMessage = document.getElementById("forgot-popup-message");

    forgotLink.addEventListener("click", function (e) {
        e.preventDefault();
        showPopup(forgotPopup);
        forgotEmailInput.focus();
    });

    forgotClose.addEventListener("click", function () {
        hidePopup(forgotPopup);
        forgotMessage.textContent = "Enter your email address to reset your password:";
        forgotEmailInput.value = "";
    });

    forgotSubmit.addEventListener("click", function () {
    const email = forgotEmailInput.value.trim();

    if (!email) {
        forgotMessage.textContent = "Please enter your email address.";
        forgotEmailInput.focus();
        return;
    }

    const accounts = loadAccounts();
    const account = accounts.find(acc => acc.email === email);

    if (account) {
        forgotMessage.textContent = `Your password is: ${account.password}`;
    } else {
        forgotMessage.textContent = "No account found with this email.";
    }
    });

});