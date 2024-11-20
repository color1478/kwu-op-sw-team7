const express = require("express");
const path = require("path");
const fs = require("fs");

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
    fs.writeFile(filePath, JSON.stringify(existingData, null, 2), (writeErr) => {
      if (writeErr) {
        console.error("Error writing to data.json:", writeErr);
        return res.status(500).send("Failed to save data.");
      }
      res.send("Data saved successfully!");
    });
  });
});




module.exports = expressApp;
