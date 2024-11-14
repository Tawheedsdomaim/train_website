document.addEventListener('DOMContentLoaded', () => {
    const searchBtn = document.getElementById('searchBtn');
    const trainTableBody = document.getElementById('trainTableBody');

    // Event listener for the search button
    searchBtn.addEventListener('click', async () => {
        const source = document.getElementById('source').value;
        const destination = document.getElementById('destination').value;
        const travelDate = document.getElementById('travelDate').value;

        try {
            // Construct URL with query parameters only if they are provided
            let url = `http://localhost:5000/api/trains`;
            const params = new URLSearchParams();

            if (source) params.append('source', source);
            if (destination) params.append('destination', destination);
            if (travelDate) params.append('travelDate', travelDate);

            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            // Fetch available trains based on search criteria
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Server error: ${response.statusText}`);
            }

            const trains = await response.json();

            // Clear previous results
            trainTableBody.innerHTML = '';

            // Populate table with train data if available
            if (trains.length > 0) {
                trains.forEach(train => {
                    const row = document.createElement('tr');

                    row.innerHTML = `
                        <td class="border-b p-2">${train.train_name}</td>
                        <td class="border-b p-2">${train.source}</td>
                        <td class="border-b p-2">${train.destination}</td>
                        <td class="border-b p-2">${new Date(train.departure_time).toLocaleString()}</td>
                        <td class="border-b p-2">${new Date(train.arrival_time).toLocaleString()}</td>
                        <td class="border-b p-2">${train.available_seats}</td>
                        <td class="border-b p-2">
                            <button 
                                class="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600" 
                                onclick="bookTrain(${train.id}, '${train.train_name}', '${train.source}', '${train.destination}', '${train.departure_time}', '${train.arrival_time}', ${train.available_seats})">
                                Book
                            </button>
                        </td>
                    `;
                    trainTableBody.appendChild(row);
                });
            } else {
                trainTableBody.innerHTML = '<tr><td colspan="7" class="text-center p-4">No trains found for the selected criteria.</td></tr>';
            }
        } catch (error) {
            console.error("Error fetching trains:", error);
            trainTableBody.innerHTML = '<tr><td colspan="7" class="text-center p-4">Failed to load trains. Please try again later.</td></tr>';
        }
    });

    // Fetch all trains on page load
    searchBtn.click(); // Simulate a click to load all trains initially
});

// Updated function to handle booking redirection with additional train details
function bookTrain(trainId, trainName, trainSource, trainDestination, trainDeparture, trainArrival, availableSeats) {
    const queryParams = new URLSearchParams({
        trainId,
        trainName,
        trainSource,
        trainDestination,
        trainDeparture,
        trainArrival,
        availableSeats,
    });

    window.location.href = `/booking.html?${queryParams.toString()}`;
}
