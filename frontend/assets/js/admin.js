// Function to fetch all trains for the admin dashboard
async function fetchTrains() {
    try {
        const response = await fetch('http://localhost:5000/api/admin/trains');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const trains = await response.json();
        populateTrainTable(trains);
    } catch (error) {
        console.error("Error fetching trains:", error);
    }
}

// Populate the train table in the admin dashboard
function populateTrainTable(trains) {
    const trainTableBody = document.getElementById('trainTableBody');
    trainTableBody.innerHTML = ''; // Clear the existing rows

    trains.forEach(train => {
        const row = document.createElement('tr');
        
        // Create table cells for each data in the train row
        const trainNameCell = document.createElement('td');
        trainNameCell.classList.add('border-b', 'px-4', 'py-2');
        trainNameCell.textContent = train.train_name;
    
        const sourceCell = document.createElement('td');
        sourceCell.classList.add('border-b', 'px-4', 'py-2');
        sourceCell.textContent = train.source;
    
        const destinationCell = document.createElement('td');
        destinationCell.classList.add('border-b', 'px-4', 'py-2');
        destinationCell.textContent = train.destination;
    
        const departureTimeCell = document.createElement('td');
        departureTimeCell.classList.add('border-b', 'px-4', 'py-2');
        departureTimeCell.textContent = new Date(train.departure_time).toLocaleString();
    
        const arrivalTimeCell = document.createElement('td');
        arrivalTimeCell.classList.add('border-b', 'px-4', 'py-2');
        arrivalTimeCell.textContent = new Date(train.arrival_time).toLocaleString();
    
        const totalSeatsCell = document.createElement('td');
        totalSeatsCell.classList.add('border-b', 'px-4', 'py-2');
        totalSeatsCell.textContent = train.total_seats;
    
        const availableSeatsCell = document.createElement('td');
        availableSeatsCell.classList.add('border-b', 'px-4', 'py-2');
        availableSeatsCell.textContent = train.available_seats;
    
        // Actions cell with Delete icon
        const actionsCell = document.createElement('td');
        actionsCell.classList.add('border-b', 'px-4', 'py-2');
        
        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('bg-red-500', 'text-white', 'px-2', 'py-1', 'rounded', 'hover:bg-red-600', 'transition');
        deleteBtn.innerHTML = `<i class="fas fa-trash-alt"></i>`;
        deleteBtn.onclick = () => deleteTrain(train.id);
    
        actionsCell.appendChild(deleteBtn);
    
        // Append each cell to the row
        row.appendChild(trainNameCell);
        row.appendChild(sourceCell);
        row.appendChild(destinationCell);
        row.appendChild(departureTimeCell);
        row.appendChild(arrivalTimeCell);
        row.appendChild(totalSeatsCell);
        row.appendChild(availableSeatsCell);
        row.appendChild(actionsCell);
    
        // Add alternating row colors for better readability
        if (train.id % 2 === 0) {
            row.classList.add('bg-gray-100'); // Even rows
        } else {
            row.classList.add('bg-white'); // Odd rows
        }
    
        // Append the row to the table body
        trainTableBody.appendChild(row);
    });
    
    
    
    
}

// Function to add a new train
document.getElementById('addTrainForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const trainData = {
        train_name: document.getElementById('train_name').value,
        source: document.getElementById('source').value,
        destination: document.getElementById('destination').value,
        departure_time: document.getElementById('departure_time').value,
        arrival_time: document.getElementById('arrival_time').value,
        total_seats: parseInt(document.getElementById('total_seats').value),
        available_seats: parseInt(document.getElementById('available_seats').value),
    };

    try {
        const response = await fetch('http://localhost:5000/api/admin/trains', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(trainData),
        });

        if (!response.ok) {
            throw new Error('Failed to add train');
        }

        await fetchTrains(); // Refresh the train list
        document.getElementById('addTrainForm').reset(); // Reset the form
    } catch (error) {
        console.error("Error adding train:", error);
    }
});

// Function to delete a train
async function deleteTrain(id) {
    try {
        const response = await fetch(`http://localhost:5000/api/admin/trains/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error('Failed to delete train');
        }

        await fetchTrains(); // Refresh the train list
    } catch (error) {
        console.error("Error deleting train:", error);
    }
}

// Call fetchTrains on page load
document.addEventListener('DOMContentLoaded', fetchTrains);
