document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");

    if (loginForm) {
        loginForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const username = document.getElementById("username").value;
            const password = document.getElementById("password").value;
            const role = document.getElementById("role").value; // Capture role from the dropdown
            const messageDiv = document.getElementById("message");

            try {
                const response = await fetch('http://localhost:5000/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password, role })
                });

                const data = await response.json();

                if (data.success) {
                    // Redirect based on role
                    if (data.role === 'admin') {
                        window.location.href = '/admin.html';
                    } else {
                        window.location.href = '/book.html';
                    }
                } else {
                    // Display the error message if login fails
                    messageDiv.textContent = data.message || 'Invalid credentials. Please try again.';
                    messageDiv.style.color = 'red';
                }
            } catch (error) {
                console.error('Error:', error);
                messageDiv.textContent = 'An error occurred. Please try again later.';
                messageDiv.style.color = 'red';
            }
        });
    } else {
        console.error("Login form not found!");
    }
});
