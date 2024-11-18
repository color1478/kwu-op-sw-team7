const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 8080;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "pages")));

// Route to serve index HTML
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./index.html"));
});

// API to handle form submission
app.post("/save-data", (req, res) => {
  const newData = req.body; // 새 데이터
  const filePath = path.join(__dirname, "data.json"); // data.json 경로

  // 기존 데이터를 읽어와서 새 데이터를 추가한 뒤 저장
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err && err.code !== "ENOENT") {
      // ENOENT: 파일이 없는 경우 (처음 실행 시)
      console.error("Error reading data.json:", err);
      return res.status(500).send("Failed to read data.");
    }

    // 기존 데이터를 파싱하거나 빈 배열로 초기화
    let existingData = [];
    if (data) {
      try {
        existingData = JSON.parse(data);
      } catch (parseError) {
        console.error("Error parsing data.json:", parseError);
        return res.status(500).send("Invalid JSON format.");
      }
    }

    // 새 데이터를 기존 데이터에 추가
    existingData.push(newData);

    // 업데이트된 데이터를 파일에 저장
    fs.writeFile(filePath, JSON.stringify(existingData, null, 2), (writeErr) => {
      if (writeErr) {
        console.error("Error writing to data.json:", writeErr);
        return res.status(500).send("Failed to save data.");
      }
      console.log("Data added successfully!");
      res.send("Data added successfully!");
    });
  });
});


// API to fetch data.json contents
app.get("/get-data", (req, res) => {
  const filePath = path.join(__dirname, "data.json");
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading data.json:", err);
      return res.status(500).send("Failed to load data.");
    }
    res.json(JSON.parse(data));
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
