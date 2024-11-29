const fs = require("fs");
const path = require("path");
const db = require("./db"); // MySQL 연결

const insertJsonData = (req, res) => {
    console.log("plz;");

    setTimeout(() => {
        console.log("Processing delayed by 2 seconds...");
        res.send("Data processed with delay!");
    }, 2000);

    const filePath = path.join(__dirname, "../data.json");

    // 1. data.json 파일 읽기
    fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
            console.error("Error reading data.json:", err);
            return res.status(500).send("Failed to read data.json.");
        }

        let jsonData;
        try {
            jsonData = JSON.parse(data); // JSON 데이터를 객체로 변환
        } catch (e) {
            console.error("Error parsing data.json:", e);
            return res.status(500).send("Invalid JSON format.");
        }

        // 2. 데이터 삽입
        jsonData.forEach((user) => {
            const { name, phone, group, groupCode, availability } = user;

            // (1) group_table에 그룹 데이터 삽입
            const groupQuery =
                "INSERT INTO group_table (group_name, unable_day, unable_time) VALUES (?, ?, ?)";
            db.query(groupQuery, [group, 0, 0], (err, groupResult) => {
                if (err) {
                    console.error(`Error inserting group ${group}:`, err);
                    return;
                }
                const groupId = groupResult.insertId; // 삽입된 그룹의 ID

                // (2) users 테이블에 사용자 데이터 삽입
                const userQuery =
                    "INSERT INTO users (user_name, phone, group_id) VALUES (?, ?, ?)";
                db.query(userQuery, [name, phone, groupId], (err) => {
                    if (err) {
                        console.error(`Error inserting user ${name}:`, err);
                        return;
                    }
                    console.log(`User ${name} inserted successfully!`);
                });

                // (3) availability_time 테이블에 가능한 시간 삽입
                for (const [day, times] of Object.entries(availability)) {
                    times.forEach((time) => {
                        const availabilityQuery =
                            "INSERT INTO availability_time (group_id, able_day, able_time, overlap) VALUES (?, ?, ?, ?)";
                        db.query(
                            availabilityQuery,
                            [groupId, parseInt(day), time, 0],
                            (err) => {
                                if (err) {
                                    console.error(
                                        `Error inserting availability for group ${group}:`,
                                        err
                                    );
                                }
                            }
                        );
                    });
                }
            });
        });

        res.send("Data insertion process completed.");
    });
};

module.exports = { insertJsonData };
