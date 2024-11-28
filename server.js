const express = require("express");
const path = require("path");
const fs = require("fs");
const mysql = require("mysql2");
const db = require("./lib/db");
const dataHandler = require("./lib/dataHandler"); // dataHandler.js 파일 가져오기
const bodyParser = require("body-parser");

const expressApp = express();

// 댓글 저장 디렉토리
const commentsDir = path.join(__dirname, "comments");

// 디렉토리 생성
if (!fs.existsSync(commentsDir)) {
    fs.mkdirSync(commentsDir);
}

// Middleware 설정
expressApp.use(bodyParser.json());
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
//=================================================================
// comment기능의 서버기능
// 특정 페이지의 댓글 파일 경로 생성
const getCommentsFilePath = (pageId) =>
    path.join(commentsDir, `${pageId}.json`);

// 파일에서 댓글 읽기
const loadComments = (pageId) => {
    const filePath = getCommentsFilePath(pageId);
    if (!fs.existsSync(filePath)) {
        return [];
    }
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
};

// 파일에 댓글 저장
const saveComments = (pageId, comments) => {
    const filePath = getCommentsFilePath(pageId);
    fs.writeFileSync(filePath, JSON.stringify(comments, null, 2), "utf-8");
};

// 특정 페이지 댓글 조회 API
expressApp.get("/api/comments/:pageId", (req, res) => {
    const { pageId } = req.params;
    const comments = loadComments(pageId);
    res.json(comments);
});

// 특정 페이지 댓글 추가 API
expressApp.post("/api/comments/:pageId", (req, res) => {
    const { pageId } = req.params;
    const { username, comment } = req.body;
    if (!username || !comment) {
        return res
            .status(400)
            .json({ error: "Username and comment are required." });
    }

    const comments = loadComments(pageId);
    const newComment = { username, comment, time: new Date().toISOString() };
    comments.push(newComment);
    saveComments(pageId, comments);

    res.status(201).json(newComment);
});

// 데이터 삽입 API 엔드포인트 정의
// '/insert-json-data'로 들어오는 요청을 처리하기 위해 dataHandler의 insertJsonData 함수를 사용
expressApp.get("/insert-json-data", dataHandler.insertJsonData);

dataHandler.insertJsonData(null, {
    send: (message) => console.log("Automatic execution result: ", message),
});

// 서버 실행 - 3000번 포트에서 서버를 실행
expressApp.listen(3000, () => {
    console.log("Server is running on port 3000");
});

module.exports = expressApp;
