document.addEventListener('DOMContentLoaded', () => {
    const bookingForm = document.getElementById('bookingForm');
    const responseMessage = document.getElementById('responseMessage');

    // Extract train details from URL parameters
    const params = new URLSearchParams(window.location.search);
    document.getElementById('trainName').textContent = `Train Name: ${params.get('trainName')}`;
    document.getElementById('trainSource').textContent = `Source: ${params.get('trainSource')}`;
    document.getElementById('trainDestination').textContent = `Destination: ${params.get('trainDestination')}`;
    document.getElementById('trainDeparture').textContent = `Departure: ${new Date(params.get('trainDeparture')).toLocaleString()}`;
    document.getElementById('trainArrival').textContent = `Arrival: ${new Date(params.get('trainArrival')).toLocaleString()}`;
    document.getElementById('trainAvailableSeats').textContent = `Available Seats: ${params.get('availableSeats')}`;

    bookingForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const bookingData = {
            name: document.getElementById('name').value,
            age: document.getElementById('age').value,
            address: document.getElementById('address').value,
            email: document.getElementById('email').value // Ensure you include the email field here if needed
        };

        try {
            const response = await fetch('http://localhost:5000/api/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookingData),
            });

            const result = await response.json();

            if (response.ok) {
                // Redirect to summary page with ticket ID on successful booking
                window.location.href = `/summary.html?ticketId=${result.ticketId}`;
            } else {
                responseMessage.textContent = `Booking failed: ${result.message}`;
                responseMessage.classList.add('text-red-500');
            }
        } catch (error) {
            responseMessage.textContent = 'An error occurred. Please try again.';
            responseMessage.classList.add('text-red-500');
        }
    });
});
