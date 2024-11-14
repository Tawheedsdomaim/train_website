document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const ticketId = params.get('ticketId');

    try {
        const response = await fetch(`http://localhost:5000/api/ticket-details?ticketId=${ticketId}`);
        const ticketDetails = await response.json();

        if (!response.ok) {
            throw new Error(ticketDetails.message || 'Failed to load ticket details');
        }

        // Update train information
        document.getElementById('trainName').textContent = `Train Name: ${ticketDetails.trainName}`;
        document.getElementById('trainSource').textContent = `Source: ${ticketDetails.trainSource}`;
        document.getElementById('trainDestination').textContent = `Destination: ${ticketDetails.trainDestination}`;
        document.getElementById('trainDeparture').textContent = `Departure: ${new Date(ticketDetails.trainDeparture).toLocaleString()}`;
        document.getElementById('trainArrival').textContent = `Arrival: ${new Date(ticketDetails.trainArrival).toLocaleString()}`;

        // Update ticket information
        document.getElementById('passengerName').textContent = `Passenger Name: ${ticketDetails.passengerName}`;
        document.getElementById('passengerAge').textContent = `Passenger Age: ${ticketDetails.passengerAge}`;
        document.getElementById('passengerAddress').textContent = `Passenger Address: ${ticketDetails.passengerAddress}`;
        document.getElementById('ticketId').textContent = `Ticket ID: ${ticketDetails.ticketId}`;
        document.getElementById('seatNumber').textContent = `Seat Number: ${ticketDetails.seatNumber}`;
        document.getElementById('price').textContent = `Price: $${ticketDetails.price}`;
        document.getElementById('ticketStatus').textContent = `Ticket Status: ${ticketDetails.ticketStatus}`;
    } catch (error) {
        console.error('Error loading ticket details:', error);
    }
});
