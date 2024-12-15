const express = require("express");
const path = require("path");
const fs = require("fs");
const bodyParser = require('body-parser');

const expressApp = express();

// 댓글 저장 디렉토리
const commentsDir = path.join(__dirname, 'comments');

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
    fs.writeFile(filePath, JSON.stringify(existingData, null, 2), (writeErr) => {
      if (writeErr) {
        console.error("Error writing to data.json:", writeErr);
        return res.status(500).send("Failed to save data.");
      }
      res.send("Data saved successfully!");
    });
  });
});

//=================================================================
// comment기능의 서버기능
// 특정 페이지의 댓글 파일 경로 생성

// MongoDB 관련 설정
//const { MongoClient } = require('mongodb');

//211.106.163.39
//parkminsuh727
//CvNvmlouSdoJ04ML

//const uri = "mongodb://parkminsuh727:CvNvmlouSdoJ04ML@211.106.163.39:27017";
//const client = new MongoClient(uri);

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://parkminseo:parkminseo@cluster0.wqsj6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let db;
const connectToDatabase = async () => {
    if (!db) {
        try {
            await client.connect();
            db = client.db("comments_db"); // 사용할 데이터베이스 이름
            console.log("Connected to MongoDB server");
        } catch (err) {
            console.error("Failed to connect to MongoDB server", err);
            throw err;
        }
    }
};

// 댓글 로드 함수
const loadComments = async (pageId) => {
    await connectToDatabase();
    const collection = db.collection("comments");

    try {
        const comments = await collection.find({ pageId }).sort({ time: 1 }).toArray(); // 시간순 정렬
        return comments;
    } catch (err) {
        console.error("Failed to load comments", err);
        throw err;
    }
};

// 댓글 저장 함수
const saveComments = async (pageId, comments) => {
    await connectToDatabase();
    const collection = db.collection("comments");

    try {
        // MongoDB에 새로운 댓글 추가
        const result = await collection.insertMany(
            comments.map(comment => ({ pageId, ...comment }))
        );
        console.log(`${result.insertedCount} comments saved.`);
    } catch (err) {
        console.error("Failed to save comments", err);
        throw err;
    }
};

// 특정 페이지 댓글 추가 API
expressApp.post('/api/comments/:pageId', async (req, res) => {
    const { pageId } = req.params;
    const { username, comment } = req.body;

    if (!username || !comment) {
        return res.status(400).json({ error: 'Username and comment are required.' });
    }

    const newComment = { username, comment, time: new Date().toISOString() };
    
    try {
        // 댓글 추가: 새로운 댓글만 저장
        await saveComments(pageId, [newComment]);
        res.status(201).json(newComment);
    } catch (err) {
        res.status(500).json({ error: 'Failed to save comment.' });
    }
});

// 특정 페이지 댓글 조회 API
expressApp.get('/api/comments/:pageId', async (req, res) => {
    const { pageId } = req.params;

    try {
        const comments = await loadComments(pageId);
        res.json(comments);
    } catch (err) {
        res.status(500).json({ error: 'Failed to load comments.' });
    }
});

//====================================================================
const getCommentsFilePath = (pageId) => path.join(commentsDir, `${pageId}.json`);

// 파일에서 댓글 읽기
const loadComments2 = (pageId) => {
    const filePath = getCommentsFilePath(pageId);
    if (!fs.existsSync(filePath)) {
        return [];
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
};

// 파일에 댓글 저장
const saveComments2 = (pageId, comments) => {
    const filePath = getCommentsFilePath(pageId);
    fs.writeFileSync(filePath, JSON.stringify(comments, null, 2), 'utf-8');
};

 
/*
// 특정 페이지 댓글 조회 API
expressApp.get('/api/comments/:pageId', (req, res) => {
    const { pageId } = req.params;
    const comments = loadComments(pageId);
    res.json(comments);
});

// 특정 페이지 댓글 추가 API
expressApp.post('/api/comments/:pageId', (req, res) => {
    const { pageId } = req.params;
    const { username, comment } = req.body;
    if (!username || !comment) {
        return res.status(400).json({ error: 'Username and comment are required.' });
    }

    const comments = loadComments(pageId);
    const newComment = { username, comment, time: new Date().toISOString() };
    comments.push(newComment);
    saveComments(pageId, comments);

    res.status(201).json(newComment);
});

*/
module.exports = expressApp;
