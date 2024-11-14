document.getElementById("paymentForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent normal form submission

    // Dummy payment processing logic
    const paymentConfirmation = document.getElementById("paymentConfirmation");
    paymentConfirmation.innerHTML = `
        <p>Payment successful! Thank you for booking your ticket.</p>
    `;

    // Here you can implement further logic to redirect to the summary page
});
