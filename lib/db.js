// db.js

const mysql = require("mysql2");

// MySQL Connection Setup
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "super0506!", // 본인의 MySQL 비밀번호로 설정
    database: "open7", // 본인의 데이터베이스 이름으로 설정
});

// Connect to MySQL
db.connect((err) => {
    if (err) {
        console.error("Error connecting to MySQL:", err);
        return;
    }
    console.log("Connected to MySQL!");
});

// MySQL 연결 객체 내보내기
module.exports = db;
