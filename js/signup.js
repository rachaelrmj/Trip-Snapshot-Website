document.addEventListener("DOMContentLoaded", function () {
    const signupForm = document.getElementById("signup-form");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const fnameInput = document.getElementById("fname");

    const confirmationPopup = document.getElementById("signup-confirmation");
    const existingAccountPopup = document.getElementById("existing-account-error");

    const closeButtons = document.querySelectorAll(".close-popup");


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


    signupForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const firstNameValue = document.getElementById("fname").value.trim(); 
    const lastNameValue = document.getElementById("lname").value.trim();
    const emailValue = emailInput.value.trim();
    const passwordValue = passwordInput.value.trim();

    let accounts = JSON.parse(localStorage.getItem("accounts")) || [];

    // Create the user object with the 'fname' key
    const newAccount = { 
        fname: firstNameValue, // This must match the key used in profile.js
        lname: lastNameValue, // This must match the key used in profile.js
        email: emailValue, 
        password: passwordValue 
    };

    accounts.push(newAccount);
    localStorage.setItem("accounts", JSON.stringify(accounts));

    // Authorize the current session immediately
    sessionStorage.setItem("currentUser", JSON.stringify(newAccount));
    
    showPopup(confirmationPopup, "profile.html");
    });
});