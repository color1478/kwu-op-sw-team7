const fs = require("fs");
const path = require("path");
const db = require("./db"); // MySQL 연결

const insertJsonData = (req, res) => {
    console.log("plz;");

    setTimeout(() => {
        console.log("Processing delayed by 2 seconds...");
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

            // (1) group_table에 그룹 데이터 삽입 (중복 확인 및 삽입)
            const groupQuery = `
                INSERT INTO group_table (group_name, group_code, unable_day, unable_time)
                VALUES (?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE group_name = group_name
            `;
            db.query(
                groupQuery,
                [group, groupCode, 0, 0],
                (err, groupResult) => {
                    if (err) {
                        console.error(`Error inserting group ${group}:`, err);
                        return;
                    }

                    const groupId = groupResult.insertId || null; // 새로 삽입된 그룹의 ID (없으면 이미 존재하는 그룹)

                    if (!groupId) {
                        // 이미 존재하는 그룹이라면 group_id 가져오기
                        const getGroupIdQuery = `
                        SELECT group_id FROM group_table WHERE group_name = ? AND group_code = ?
                    `;
                        db.query(
                            getGroupIdQuery,
                            [group, groupCode],
                            (err, results) => {
                                if (err || results.length === 0) {
                                    console.error(
                                        `Error retrieving group ID for ${group}:`,
                                        err
                                    );
                                    return;
                                }
                                processUserAndAvailability(
                                    user,
                                    results[0].group_id
                                );
                            }
                        );
                    } else {
                        // 새로 삽입된 그룹
                        processUserAndAvailability(user, groupId);
                    }
                }
            );
        });

        const processUserAndAvailability = (user, groupId) => {
            const { name, phone, availability } = user;

            // (2) users 테이블에 사용자 데이터 삽입 (중복 확인)
            const userQuery = `
                INSERT INTO users (user_name, phone, group_id)
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE user_name = user_name
            `;
            db.query(userQuery, [name, phone, groupId], (err) => {
                if (err) {
                    console.error(`Error inserting user ${name}:`, err);
                    return;
                }
                console.log(`User ${name} inserted or already exists.`);

                // (3) availability_time 테이블에 가능한 시간 삽입
                for (const [day, times] of Object.entries(availability)) {
                    times.forEach((time) => {
                        const availabilityQuery = `
                            INSERT INTO availability_time (group_id, able_day, able_time, overlap)
                            VALUES (?, ?, ?, ?)
                            ON DUPLICATE KEY UPDATE overlap = overlap + 1
                        `;
                        db.query(
                            availabilityQuery,
                            [groupId, parseInt(day), time, 0],
                            (err) => {
                                if (err) {
                                    console.error(
                                        `Error inserting availability for group ${groupId}:`,
                                        err
                                    );
                                }
                            }
                        );
                    });
                }
            });
        };

        res.send("Data insertion process completed.");
    });
};

module.exports = { insertJsonData };
