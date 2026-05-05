document.addEventListener("DOMContentLoaded", function () {
    const signupForm = document.getElementById("signup-form");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const fnameInput = document.getElementById("fname");

    const confirmationPopup = document.getElementById("signup-confirmation");
    const existingAccountPopup = document.getElementById("existing-account-error");

    // Grab all buttons that can close popups
    const closeButtons = document.querySelectorAll(".close-popup");

    // Display popup modal
    function showPopup(modal, redirectUrl = null) {
        modal.style.display = "flex"; // Make popup visible (flex centers it in UI)

        // If a redirect URL is provided, store it inside the modal element
        if (redirectUrl) modal.dataset.redirect = redirectUrl;
    }

    // Attach click behavior to every popup close button
    closeButtons.forEach(button => {
        button.addEventListener("click", function () {

            // Find the closest popup container this button belongs to
            const modal = this.closest(".popup-window");

            // Hide the popup from view
            modal.style.display = "none";

            // If this popup had a redirect stored, send user to that page
            if (modal.dataset.redirect) {
                window.location.href = modal.dataset.redirect;
            }
        });
    });

    signupForm.addEventListener("submit", function (event) {
        // Prevent efault form behavior
        event.preventDefault();

        // Get values the user typed into the form fields and remove white space
        const firstNameValue = document.getElementById("fname").value.trim();
        const lastNameValue = document.getElementById("lname").value.trim();
        const emailValue = emailInput.value.trim();
        const passwordValue = passwordInput.value.trim();

        // Load existing user accounts from localStorage, if nothing exists yet, create an empty array
        let accounts = JSON.parse(localStorage.getItem("accounts")) || [];

        // Check if an account with this email already exists
        const emailExists = accounts.some(acc => acc.email === emailValue);

        // If email is already registered, stop signup process
        if (emailExists) {
            // If there is a custom popup element in HTML, show it instead of alert
            if (existingAccountPopup) {
                showPopup(existingAccountPopup);
            } else {
                // fallback if HTML popup element doesn't exist
                alert("An account with this email already exists. Please log in.");
            }

            return; // Stop further code execution
        }

        // Build a new user object using form input values
        const newAccount = {
            fname: firstNameValue,
            lname: lastNameValue,
            email: emailValue,
            password: passwordValue
        };

        // Add new account into existing accounts list
        accounts.push(newAccount);

        // Save updated accounts list back into localStorage
        localStorage.setItem("accounts", JSON.stringify(accounts));

        // Immediately log user in after signup
        // sessionStorage is used so login only lasts for this tab/session
        sessionStorage.setItem("currentUser", JSON.stringify(newAccount));

        // Show success popup and redirect user to profile page after closing it
        showPopup(confirmationPopup, "profile.html");
    });
});