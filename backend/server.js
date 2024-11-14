// server.js

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const router = express.Router();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// MySQL connection
const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root', // replace with your MySQL username
    password: 'Tawheed123@', // replace with your MySQL password
    database: 'Railways_Management' // replace with your database name
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to MySQL database');
});


app.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body;
    
    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user into the database
        const sql = 'INSERT INTO Users (username, email, password) VALUES (?, ?, ?)';
        db.query(sql, [username, email, hashedPassword], (err, result) => {
            if (err) {
                console.error('Error inserting user:', err);
                res.status(500).json({ message: 'Server error. Please try again later.' });
            } else {
                res.status(201).json({ message: 'User registered successfully!' });
            }
        });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});


// Inside your Express app (server.js)


// Updated User login endpoint
app.post('/api/login', (req, res) => {
    const { username, password, role } = req.body;

    console.log(`Received login request - Username: ${username}, Role: ${role}`); // Debug log

    const query = 'SELECT * FROM Users WHERE username = ? AND role = ?';
    db.query(query, [username, role], async (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ success: false, message: 'Server error.' });
        }

        // Check if user exists
        if (results.length === 0) {
            console.warn("No user found with the provided username and role.");
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }

        const user = results[0];
        console.log("User found in database:", user); // Debug log

        // Check password match
        try {
            const isPasswordMatch = await bcrypt.compare(password, user.password);
            if (isPasswordMatch) {
                console.log("Password match successful.");
                res.json({ success: true, role: user.role });
            } else {
                console.warn("Password does not match.");
                res.status(401).json({ success: false, message: 'Invalid credentials.' });
            }
        } catch (bcryptError) {
            console.error("Error during password comparison:", bcryptError);
            res.status(500).json({ success: false, message: 'Server error.' });
        }
    });
});

app.get('/api/trains', (req, res) => {
    const { source, destination, travelDate } = req.query;

    let query = 'SELECT * FROM Trains WHERE 1=1';
    const queryParams = [];

    if (source) {
        query += ' AND source = ?';
        queryParams.push(source);
    }
    if (destination) {
        query += ' AND destination = ?';
        queryParams.push(destination);
    }
    if (travelDate) {
        query += ' AND DATE(departure_time) = ?';
        queryParams.push(travelDate);
    }

    // Use db instead of connection
    db.query(query, queryParams, (error, results) => {
        if (error) {
            console.error("Error fetching trains:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
        res.json(results);
    });
});


// Route to handle redirection to booking page with selected train
app.get('/api/book/:trainId', (req, res) => {
    const trainId = req.params.trainId;
    res.redirect(`/booking.html?trainId=${trainId}`);
});

// Add this route to your server.js

app.post('/api/book-ticket', (req, res) => {
    const { trainId, passengerName, email, phone, numberOfTickets } = req.body;

    // Start a transaction
    db.beginTransaction((err) => {
        if (err) {
            console.error("Error starting transaction:", err);
            return res.status(500).json({ message: 'Transaction error. Please try again later.' });
        }

        // First, update the available seats for the train
        const updateSeatsQuery = 'UPDATE Trains SET available_seats = available_seats - ? WHERE id = ? AND available_seats >= ?';
        db.query(updateSeatsQuery, [numberOfTickets, trainId, numberOfTickets], (err, result) => {
            if (err) {
                console.error("Error updating seats:", err);
                return db.rollback(() => {
                    res.status(500).json({ message: 'Error updating seats. Please try again later.' });
                });
            }

            // Check if any rows were affected
            if (result.affectedRows === 0) {
                console.warn("Not enough available seats for booking.");
                return db.rollback(() => {
                    res.status(400).json({ message: 'Not enough available seats.' });
                });
            }

            // Insert booking details into the Bookings table
            const insertBookingQuery = 'INSERT INTO Bookings (train_id, passenger_name, email, phone, number_of_tickets) VALUES (?, ?, ?, ?, ?)';
            db.query(insertBookingQuery, [trainId, passengerName, email, phone, numberOfTickets], (err, result) => {
                if (err) {
                    console.error("Error inserting booking:", err);
                    return db.rollback(() => {
                        res.status(500).json({ message: 'Error processing booking. Please try again later.' });
                    });
                }

                // Commit the transaction
                db.commit((err) => {
                    if (err) {
                        console.error("Error committing transaction:", err);
                        return db.rollback(() => {
                            res.status(500).json({ message: 'Transaction error. Please try again later.' });
                        });
                    }

                    res.status(201).json({ message: 'Booking successful!' });
                });
            });
        });
    });
});

app.get('/api/admin/trains', (req, res) => {
    const query = 'SELECT * FROM Trains';
    db.query(query, (error, results) => {
        if (error) {
            console.error("Error fetching trains for admin:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
        res.json(results); // Return the fetched train data
    });
});

// API endpoint to add a new train
app.post('/api/admin/trains', (req, res) => {
    const { train_name, source, destination, departure_time, arrival_time, total_seats, available_seats } = req.body;
    const query = `
        INSERT INTO Trains (train_name, source, destination, departure_time, arrival_time, total_seats, available_seats)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(query, [train_name, source, destination, departure_time, arrival_time, total_seats, available_seats], (error, results) => {
        if (error) {
            console.error("Error adding train:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
        res.status(201).json({ id: results.insertId, message: "Train added successfully" });
    });
});

// API endpoint to delete a train
app.delete('/api/admin/trains/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM Trains WHERE id = ?';
    db.query(query, [id], (error, results) => {
        if (error) {
            console.error("Error deleting train:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: "Train not found" });
        }
        res.json({ message: "Train deleted successfully" });
    });
});

app.post('/api/submit', (req, res) => {
    const { name, age, address, email } = req.body;

    // You may want to replace this with actual logic to assign a seat number and calculate the price
    const seatNumber = Math.floor(Math.random() * 100); // Mocked seat number
    const price = 400.00; // Mocked price, change according to your logic

    const userId = 1; // Replace with the actual logged-in user ID
    const trainId = 1; // Replace with the actual train ID from the selection

    const sql = `INSERT INTO Tickets (user_id, train_id, seat_number, passenger_name, passenger_age, passenger_address, email, price) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(sql, [userId, trainId, seatNumber, name, age, address, email, price], (err, result) => {
        if (err) {
            console.error('Error inserting ticket:', err);
            return res.status(500).json({ message: 'Booking failed. Please try again.' });
        }

        // Optionally, you can return the ticket ID if needed
        res.status(201).json({ ticketId: result.insertId });
    });
});

// Assuming Express and your database connection (e.g., MySQL) are already set up
// Assuming you're using Express and MySQL
app.get('/api/ticket-details', (req, res) => {
    const { ticketId } = req.query;

    const sql = `
        SELECT 
            T.id AS ticketId,
            T.passenger_name AS passengerName,
            T.passenger_age AS passengerAge,
            T.passenger_address AS passengerAddress,
            T.email AS email,
            T.seat_number AS seatNumber,
            T.price AS price,
            Tr.train_name AS trainName,
            Tr.source AS trainSource,
            Tr.destination AS trainDestination,
            Tr.departure_time AS trainDeparture,
            Tr.arrival_time AS trainArrival,
            T.status AS ticketStatus
        FROM Tickets T
        JOIN Trains Tr ON T.train_id = Tr.id
        WHERE T.id = ?
    `;

    db.query(sql, [ticketId], (err, results) => {
        if (err) {
            console.error('Error fetching ticket details:', err);
            return res.status(500).json({ message: 'Failed to fetch ticket details' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Ticket not found' });
        }
        res.json(results[0]);
    });
});


// API to retrieve ticket and train details by ticket ID


// Start the server
app.listen(5000, () => {
    console.log('Server is running on http://localhost:5000');
});

