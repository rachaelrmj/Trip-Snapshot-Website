document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("signup-form");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");

    const confirmationPopup = document.getElementById("signup-confirmation");
    const errorPopup = document.getElementById("signup-error");
    const existingAccountPopup = document.getElementById("existing-account");

    const closeButtons = document.querySelectorAll(".close-popup");
    const datalist = document.getElementById("registered-emails");
    let lastFocusedElement;

    /** Utility: show popup */
    function showPopup(modal, redirectUrl = null, message = null) {
        lastFocusedElement = document.activeElement;
        if (message) modal.querySelector("p").textContent = message;
        modal.dataset.redirect = redirectUrl || "";
        modal.style.display = "flex"; // match login popup display
        modal.setAttribute("aria-hidden", "false");
        trapFocus(modal);
    }

    /** Utility: hide popup */
    function hidePopup(modal) {
        modal.style.display = "none";
        modal.setAttribute("aria-hidden", "true");
        if (lastFocusedElement) lastFocusedElement.focus();
    }

    /** Accessibility focus trap */
    function trapFocus(modal) {
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusableElements.length) return;

        const firstEl = focusableElements[0];
        const lastEl = focusableElements[focusableElements.length - 1];

        firstEl.focus();

        modal.addEventListener('keydown', function (e) {
            if (e.key === 'Tab') {
                if (e.shiftKey && document.activeElement === firstEl) {
                    e.preventDefault();
                    lastEl.focus();
                } else if (!e.shiftKey && document.activeElement === lastEl) {
                    e.preventDefault();
                    firstEl.focus();
                }
            }
            if (e.key === 'Escape') hidePopup(modal);
        });
    }

    /** Close popup buttons */
    closeButtons.forEach(button => {
        button.addEventListener("click", function () {
            const modal = this.closest(".popup-window");
            hidePopup(modal);

            // Handle redirects like login popup
            if (modal.dataset.redirect) {
                window.location.href = modal.dataset.redirect;
            }
        });
    });

    /** Load accounts from localStorage */
    function loadAccounts() {
        return JSON.parse(localStorage.getItem("accounts")) || [];
    }

    /** Save accounts to localStorage */
    function saveAccounts(accounts) {
        localStorage.setItem("accounts", JSON.stringify(accounts));
    }

    /** Populate datalist for auto-complete */
    function populateDatalist() {
        const accounts = loadAccounts();
        datalist.innerHTML = "";
        accounts.forEach(acc => {
            const option = document.createElement("option");
            option.value = acc.email;
            datalist.appendChild(option);
        });
    }

    populateDatalist();

    /** Form submission */
    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {
            showPopup(errorPopup, null, "Please enter a valid email address.");
            emailInput.focus();
            return;
        }

        if (!password) {
            showPopup(errorPopup, null, "Password cannot be empty.");
            passwordInput.focus();
            return;
        }

        let accounts = loadAccounts();

        const existingAccount = accounts.find(acc => acc.email.toLowerCase() === email.toLowerCase());
        if (existingAccount) {
            showPopup(existingAccountPopup, "login.html", "Account already exists. Please log in.");
            return;
        }

        // Add new account
        accounts.push({ email, password });
        saveAccounts(accounts);
        populateDatalist();

        showPopup(confirmationPopup, "profile.html", "Account created successfully!");
    });

});