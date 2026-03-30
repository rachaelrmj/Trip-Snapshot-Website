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
    function showPopup(modal) {
        lastFocusedElement = document.activeElement;
        modal.style.display = "block";
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
            if (e.key === 'Escape') {
                hidePopup(modal);
            }
        });
    }

    /** Close popup buttons */
    closeButtons.forEach(button => {
        button.addEventListener("click", function () {
            const modal = this.closest(".popup-window");
            hidePopup(modal);
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

    // Initial datalist population
    populateDatalist();

    /** Form submission */
    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {
            alert("Please enter a valid email address.");
            emailInput.focus();
            return;
        }

        if (!password) {
            showPopup(errorPopup);
            return;
        }

        try {
            let accounts = loadAccounts();

            // Check if account already exists
            const existingAccount = accounts.find(acc => acc.email === email);
            if (existingAccount) {
                showPopup(existingAccountPopup);
                return;
            }

            // Add new account
            accounts.push({ email, password });
            saveAccounts(accounts);

            // Refresh datalist with new account
            populateDatalist();

            // Show success popup
            showPopup(confirmationPopup);

        } catch (err) {
            console.error(err);
            showPopup(errorPopup);
        }
    });

    /** Redirect after popup close */
    document.querySelector("#signup-confirmation .close-popup")
        .addEventListener("click", function () {
            window.location.href = "profile.html";
        });

    document.querySelector("#existing-account .close-popup")
        .addEventListener("click", function () {
            window.location.href = "login.html";
        });

});