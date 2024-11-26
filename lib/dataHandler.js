const fs = require("fs");
const path = require("path");
const db = require("./db");

const insertJsonData = (req, res) => {
  console.log("Received request to insert JSON data.");
  
  const filePath = path.join(__dirname, "../data.json");
  console.log("Reading data from:", filePath);

  // 1. data.json 파일 읽기
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading data.json:", err);
      return res.status(500).send("Failed to read data.json.");
    }

    let jsonData;
    try {
      jsonData = JSON.parse(data);
    } catch (e) {
      console.error("Error parsing data.json:", e);
      return res.status(500).send("Invalid JSON format in data.json.");
    }

    // 2. group_table 테이블에 데이터 삽입
    console.log("Inserting data into group_table.");
    const groupQuery = "INSERT INTO group_table (group_name, unable_day, unable_time) VALUES (?, ?, ?)";
    jsonData.forEach((item) => {
      const { group_name, unable_day, unable_time } = item;
      db.query(groupQuery, [group_name, unable_day, unable_time], (err, results) => {
        if (err) {
          console.error("Error inserting data into group_table:", err);
          return;
        }

        console.log(`Group ${group_name} inserted successfully with ID: ${results.insertId}`);
        const groupId = results.insertId;

        // 3. users 테이블에 데이터 삽입
        const { user_name, phone } = item;
        const userQuery = "INSERT INTO users (user_name, phone, group_id) VALUES (?, ?, ?)";
        db.query(userQuery, [user_name, phone, groupId], (err) => {
          if (err) {
            console.error("Error inserting data into users table:", err);
            return;
          }
          console.log(`User ${user_name} inserted successfully.`);
        });

        // 4. availability_time 테이블에 unable의 반대 값을 able로 변환하여 삽입
        const ableDay = unable_day === 1 ? 0 : 1; // unable_day가 1이면 able_day는 0, 반대도 마찬가지
        const ableTime = unable_time === 1 ? 0 : 1; // unable_time이 1이면 able_time은 0, 반대도 마찬가지

        const availabilityQuery = "INSERT INTO availability_time (group_id, able_day, able_time, overlap) VALUES (?, ?, ?, ?)";
        db.query(availabilityQuery, [groupId, ableDay, ableTime, 0], (err) => {
          if (err) {
            console.error("Error inserting data into availability_time table:", err);
            return;
          }
          console.log(`Availability for group ${group_name} inserted successfully.`);
        });

        // 5. 같은 group_id에 대해 overlap 값 업데이트
        const overlapQuery = `
          UPDATE availability_time
          SET overlap = (
            SELECT COUNT(*) 
            FROM availability_time 
            WHERE group_id = ? AND able_day = ? AND able_time = ?
          )
          WHERE group_id = ? AND able_day = ? AND able_time = ?;
        `;
        db.query(overlapQuery, [groupId, ableDay, ableTime, groupId, ableDay, ableTime], (err) => {
          if (err) {
            console.error("Error updating overlap in availability_time table:", err);
          } else {
            console.log(`Overlap for group ${group_name} updated successfully.`);
          }
        });
      });
    });

    res.send("Data insertion process initiated.");
  });
};

module.exports = { insertJsonData };
