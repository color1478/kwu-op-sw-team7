const express = require("express");
const path = require("path");
const mysql = require("mysql2");
const db = require("./lib/db"); // MySQL 연결 설정
const bodyParser = require("body-parser");
const fs = require("fs");

const expressApp = express();

// Middleware 설정
expressApp.use(bodyParser.json());
expressApp.use(express.static(path.join(__dirname, "pages")));

// Serve index.html as the default page
expressApp.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "pages/html/index.html"));
});

// ------------------ 데이터 삽입 및 조회 관련 코드 ------------------

// 데이터 삽입 API (데이터를 SQL 테이블에 저장)
expressApp.post("/save-data", (req, res) => {
    const { name, phone, group, groupCode, availability } = req.body;

    if (!name || !phone || !group || !groupCode || !availability) {
        return res.status(400).json({ error: "Missing required fields." });
    }

    // 그룹 데이터 삽입
    const groupQuery = `
        INSERT INTO group_table (group_name, group_code, unable_day, unable_time)
        VALUES (?, ?, 0, 0)
    `;
    db.query(groupQuery, [group, groupCode], (err, groupResult) => {
        if (err) {
            if (err.code === "ER_DUP_ENTRY") {
                console.error(`Duplicate group name: ${group}`);
                return res
                    .status(409)
                    .json({ error: "Group name already exists." });
            } else {
                console.error(`Error inserting group ${group}:`, err);
                return res
                    .status(500)
                    .json({ error: "Failed to save group data." });
            }
        }

        // 그룹 ID 가져오기
        const groupId = groupResult.insertId || null;
        if (!groupId) {
            return res.status(500).json({ error: "Failed to get group ID." });
        }

        // 사용자 데이터 삽입
        const userQuery = `
            INSERT INTO users (user_name, phone, group_id)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE user_name = VALUES(user_name)
        `;
        db.query(userQuery, [name, phone, groupId, true], (err) => {
            if (err) {
                console.error("Error inserting user:", err);
                return res
                    .status(500)
                    .json({ error: "Failed to save user data." });
            }

            // 가능한 시간 데이터 삽입
            const availabilityPromises = [];
            for (const [day, times] of Object.entries(availability)) {
                times.forEach((time) => {
                    const availabilityQuery = `
                        INSERT INTO availability_time (group_id, able_day, able_time, overlap)
                        VALUES (?, ?, ?, 0)
                        ON DUPLICATE KEY UPDATE overlap = overlap + 1
                    `;
                    availabilityPromises.push(
                        new Promise((resolve, reject) => {
                            db.query(
                                availabilityQuery,
                                [groupId, parseInt(day), time],
                                (err) => {
                                    resolve();
                                }
                            );
                        })
                    );
                });
            }

            Promise.all(availabilityPromises)
                .then(() => res.send("Data saved successfully!"))
                .catch((err) => {
                    console.error("Failed to insert availability times:", err);
                    res.status(500).json({
                        error: "Failed to save availability data.",
                    });
                });
        });
    });
});

// 그룹 이름만으로 조회 API
expressApp.get("/search-group", (req, res) => {
    const { group } = req.query;

    if (!group) {
        return res.status(400).json({ error: "Group name is required." });
    }

    const query = `
        SELECT group_name 
        FROM group_table 
        WHERE LOWER(group_name) = LOWER(?)
    `;

    db.query(query, [group], (err, results) => {
        if (err) {
            console.error("Error searching for group:", err);
            return res.status(500).json({ error: "Failed to search group." });
        }

        if (results.length > 0) {
            res.json({ groups: results.map((row) => row.group_name) });
        } else {
            res.json({ groups: [] });
        }
    });
});

// expressApp.get("/get-data", (req, res) => {
//     const query = `
//         SELECT group_name AS group, group_code
//         FROM group_table
//     `;

//     db.query(query, (err, results) => {
//         if (err) {
//             console.error("Error fetching group data:", err);
//             return res.status(500).json({ error: "Failed to fetch data." });
//         }
//         res.json(results);
//     });
// });

// ------------------ 댓글 관련 코드 유지 ------------------

// 댓글 저장 디렉토리
const commentsDir = path.join(__dirname, "comments");

// 디렉토리 생성
if (!fs.existsSync(commentsDir)) {
    fs.mkdirSync(commentsDir);
}

// MongoDB 관련 설정
const { MongoClient, ServerApiVersion } = require("mongodb");
const uri =
    "mongodb+srv://parkminseo:parkminseo@cluster0.wqsj6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

let mongoDB;
const connectToDatabase = async () => {
    if (!mongoDB) {
        try {
            await client.connect();
            mongoDB = client.db("comments_db"); // 사용할 데이터베이스 이름
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
    const collection = mongoDB.collection("comments");

    try {
        const comments = await collection
            .find({ pageId })
            .sort({ time: 1 })
            .toArray(); // 시간순 정렬
        return comments;
    } catch (err) {
        console.error("Failed to load comments", err);
        throw err;
    }
};

// 댓글 저장 함수
const saveComments = async (pageId, comments) => {
    await connectToDatabase();
    const collection = mongoDB.collection("comments");

    try {
        const result = await collection.insertMany(
            comments.map((comment) => ({ pageId, ...comment }))
        );
        console.log(`${result.insertedCount} comments saved.`);
    } catch (err) {
        console.error("Failed to save comments", err);
        throw err;
    }
};

// 특정 페이지 댓글 추가 API
expressApp.post("/api/comments/:pageId", async (req, res) => {
    const { pageId } = req.params;
    const { username, comment } = req.body;

    if (!username || !comment) {
        return res
            .status(400)
            .json({ error: "Username and comment are required." });
    }

    const newComment = { username, comment, time: new Date().toISOString() };

    try {
        await saveComments(pageId, [newComment]);
        res.status(201).json(newComment);
    } catch (err) {
        res.status(500).json({ error: "Failed to save comment." });
    }
});

// 특정 페이지 댓글 조회 API
expressApp.get("/api/comments/:pageId", async (req, res) => {
    const { pageId } = req.params;

    try {
        const comments = await loadComments(pageId);
        res.json(comments);
    } catch (err) {
        res.status(500).json({ error: "Failed to load comments." });
    }
});

module.exports = expressApp;
