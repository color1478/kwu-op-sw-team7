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

    // Step 1: 그룹 데이터 삽입
    const groupQuery = `
        INSERT INTO group_table (group_name, group_code, unable_day, unable_time)
        VALUES (?, ?, 0, 0)
        ON DUPLICATE KEY UPDATE group_name = group_name
    `;
    db.query(groupQuery, [group, groupCode], (err, groupResult) => {
        if (err) {
            console.error(`Error inserting group ${group}:`, err);
            return res.status(500).send("Failed to save group data.");
        }

        // Step 2: 그룹 ID 가져오기
        const groupId = groupResult.insertId || null;

        const getGroupIdQuery = `
            SELECT group_id FROM group_table WHERE group_name = ? AND group_code = ?
        `;
        db.query(getGroupIdQuery, [group, groupCode], (err, results) => {
            if (err || results.length === 0) {
                console.error(`Error retrieving group ID for ${group}:`, err);
                return res.status(500).send("Failed to retrieve group ID.");
            }
            const finalGroupId = results[0].group_id;

            // Step 3: 사용자 데이터 삽입
            const userQuery = `
                INSERT INTO users (user_name, phone, group_id)
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE user_name = user_name
            `;
            db.query(userQuery, [name, phone, finalGroupId], (err) => {
                if (err) {
                    console.error(`Error inserting user ${name}:`, err);
                    return res.status(500).send("Failed to save user data.");
                }

                // Step 4: 가능한 시간 데이터 삽입
                for (const [day, times] of Object.entries(availability)) {
                    times.forEach((time) => {
                        const availabilityQuery = `
                            INSERT INTO availability_time (group_id, able_day, able_time, overlap)
                            VALUES (?, ?, ?, 0)
                            ON DUPLICATE KEY UPDATE overlap = overlap + 1
                        `;
                        db.query(
                            availabilityQuery,
                            [finalGroupId, parseInt(day), time],
                            (err) => {
                                if (err) {
                                    console.error(
                                        `Error inserting availability for group ${finalGroupId}:`,
                                        err
                                    );
                                }
                            }
                        );
                    });
                }

                res.send("Data saved successfully!");
            });
        });
    });
});

// 데이터 조회 API (SQL에서 그룹 찾기)
expressApp.get("/search-group", (req, res) => {
    const { name, phone } = req.query;

    if (!name || !phone) {
        return res.status(400).json({ error: "Name and phone are required." });
    }

    const query = `
        SELECT g.group_name 
        FROM users u
        JOIN group_table g ON u.group_id = g.group_id
        WHERE u.user_name = ? AND u.phone = ?
    `;

    db.query(query, [name, phone], (err, results) => {
        if (err) {
            console.error("Error searching for groups:", err);
            return res.status(500).json({ error: "Failed to search groups." });
        }

        if (results.length > 0) {
            const groups = results.map((row) => row.group_name);
            res.json({ groups });
        } else {
            res.json({ groups: [] });
        }
    });
});

// ------------------ 댓글 관련 코드 유지 ------------------

// 댓글 저장 디렉토리
const commentsDir = path.join(__dirname, "comments");

// 디렉토리 생성
if (!fs.existsSync(commentsDir)) {
    fs.mkdirSync(commentsDir);
}

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

// ------------------ 서버 실행 ------------------
expressApp.listen(3000, () => {
    console.log("Server is running on port 3000");
});

module.exports = expressApp;
