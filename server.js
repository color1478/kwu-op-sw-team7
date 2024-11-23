const express = require("express");
const path = require("path");
const fs = require("fs");
const mysql = require("mysql2");
const db = require("./lib/db");

const expressApp = express();

// Serve static files from the 'pages' directory
expressApp.use(express.static(path.join(__dirname, "pages")));

// Serve index.html as the default page
expressApp.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "pages/html/index.html"));
});

// API to fetch data.json contents
expressApp.get("/get-data", (req, res) => {
    const filePath = path.join(__dirname, "data.json");
    fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
            console.error("Error reading data.json:", err);
            return res.status(500).send("Failed to load data.");
        }
        res.json(JSON.parse(data));
    });
});

// API to save data to data.json
expressApp.post("/save-data", express.json(), (req, res) => {
    const newData = req.body;
    const filePath = path.join(__dirname, "data.json");

    // Read existing data
    fs.readFile(filePath, "utf8", (err, data) => {
        let existingData = [];
        if (!err) {
            try {
                existingData = JSON.parse(data);
            } catch (e) {
                console.error("Error parsing data.json:", e);
            }
        }

        // Append new data
        existingData.push(newData);

        // Write updated data
        fs.writeFile(
            filePath,
            JSON.stringify(existingData, null, 2),
            (writeErr) => {
                if (writeErr) {
                    console.error("Error writing to data.json:", writeErr);
                    return res.status(500).send("Failed to save data.");
                }
                res.send("Data saved successfully!");
            }
        );
    });
});

// New API to fetch data from MySQL
expressApp.get("/get-mysql-data", (req, res) => {
    const query = "SELECT * FROM your_table_name";
    db.query(query, (err, results) => {
        if (err) {
            console.error("Error fetching data from MySQL:", err);
            return res.status(500).send("Failed to load data from MySQL.");
        }
        res.json(results);
    });
});

// New API to insert data into MySQL
expressApp.post("/save-mysql-data", express.json(), (req, res) => {
    const { name, age } = req.body;
    const query = "INSERT INTO your_table_name (name, age) VALUES (?, ?)";
    db.query(query, [name, age], (err, results) => {
        if (err) {
            console.error("Error inserting data into MySQL:", err);
            return res.status(500).send("Failed to save data to MySQL.");
        }
        res.send("Data saved to MySQL successfully!");
    });
});

// This API endpoint ('/save-mysql-data') is added to insert data into the MySQL database.
// It reads 'name' and 'age' from the request body, constructs an SQL INSERT query,
// and inserts the values into the specified table. It responds with a success message if the operation completes without errors.

module.exports = expressApp;
