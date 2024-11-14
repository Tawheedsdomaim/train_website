// Example interactive feature for welcoming the user
document.addEventListener("DOMContentLoaded", function() {
    const headerText = document.querySelector("header h1");
    const subText = document.querySelector("header p");

    // Adds a typewriter effect to the header subtext
    let welcomeText = "Effortlessly plan your journey with us";
    let index = 0;

    function typeEffect() {
        if (index < welcomeText.length) {
            subText.innerHTML += welcomeText[index];
            index++;
            setTimeout(typeEffect, 50); // Speed of typing
        }
    }
    typeEffect();
});



document.addEventListener("DOMContentLoaded", () => {
    // Registration Form Validation and Submission
    const registrationForm = document.getElementById("registration-form");
    if (registrationForm) {
        registrationForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            // Gather form data
            const username = document.getElementById("username").value;
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;
            const confirmPassword = document.getElementById("confirm-password").value;

            // Basic validation: Check if passwords match
            if (password !== confirmPassword) {
                alert("Passwords do not match. Please try again.");
                return;
            }

            try {
                // Send the registration data to the backend
                const response = await fetch("http://localhost:5000/api/register", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ username, email, password })
                });

                // Handle response
                const data = await response.json();
                if (response.ok) {
                    alert(data.message);  // Show success message
                    window.location.href = "login.html"; // Redirect to login page
                } else {
                    alert(data.message || "Registration failed. Please try again.");
                }
            } catch (error) {
                console.error("Error:", error);
                alert("An error occurred while registering. Please try again.");
            }
        });
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");
    const errorMessage = document.getElementById("errorMessage");

    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault(); // Prevent the default form submission

        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        try {
            const response = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            if (!response.ok) {
                throw new Error('Login failed');
            }

            const data = await response.json();

            if (data.success) {
                // Redirect based on role
                if (data.role === 'admin') {
                    window.location.href = 'admin-dashboard.html'; // Redirect to admin dashboard
                } else {
                    window.location.href = 'book.html'; // Redirect to booking page
                }
            } else {
                errorMessage.textContent = data.message; // Show error message
            }
        } catch (error) {
            console.error('Error during login:', error);
            errorMessage.textContent = 'An error occurred while logging in. Please try again.';
        }
    });
});
