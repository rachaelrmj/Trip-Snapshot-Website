document.addEventListener("DOMContentLoaded", () => {
const btn = document.getElementById("theme-toggle");
    if (btn) {
        // Load saved mode
        if (localStorage.getItem("theme") === "dark") {
            document.body.classList.add("dark-mode");
        }

        // Toggle
        btn.addEventListener("click", () => {
            document.body.classList.toggle("dark-mode");
            const isDark = document.body.classList.contains("dark-mode");
            localStorage.setItem("theme", isDark ? "dark" : "light");
        });
    }
});

