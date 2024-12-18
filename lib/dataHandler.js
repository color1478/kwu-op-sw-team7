const db = require("./db"); // MySQL 연결 설정

// JSON 데이터 삽입 함수
const insertJsonData = (req, res) => {
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
};

module.exports = { insertJsonData };
