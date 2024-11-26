// dataHandler.js

const fs = require("fs");
const path = require("path");
const db = require("./db"); // db.js 파일에서 MySQL 연결 객체 가져오기

// JSON 데이터를 데이터베이스에 삽입하는 함수 정의
function insertJsonData(req, res) {
    // JSON 파일의 경로 설정
    const filePath = path.join(__dirname, "..", "data.json");

    // JSON 파일 읽기
    fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
            // 파일 읽기 중 오류가 발생한 경우 처리
            console.error("Error reading data.json:", err);
            return res.status(500).send("Failed to read data.json");
        }

        try {
            // JSON 데이터 파싱
            const users = JSON.parse(data);

            // 각 사용자 데이터를 MySQL에 삽입
            users.forEach((user) => {
                const { name, phone, group, groupCode, availability } = user;
                // 데이터베이스에 삽입할 SQL 쿼리 정의
                const query = `
          INSERT INTO users (name, phone, \`group\`, groupCode, availability) 
          VALUES (?, ?, ?, ?, ?)
        `;
                // 데이터베이스 쿼리 실행
                db.query(
                    query,
                    [name, phone, group, groupCode, availability],
                    (err, results) => {
                        if (err) {
                            // 데이터 삽입 중 오류가 발생한 경우 처리
                            console.error(
                                "Error inserting data into MySQL:",
                                err
                            );
                            return;
                        }
                        // 데이터가 성공적으로 삽입된 경우 로그 출력
                        console.log(
                            "Data inserted successfully:",
                            results.insertId
                        );
                    }
                );
            });

            // 모든 데이터 삽입 작업이 시작되었음을 클라이언트에 응답
            res.send(
                "Data insertion process initiated. Check console for details."
            );
        } catch (parseError) {
            // JSON 데이터 파싱 중 오류가 발생한 경우 처리
            console.error("Error parsing data.json:", parseError);
            return res.status(500).send("Failed to parse data.json");
        }
    });
}

// insertJsonData 함수를 외부에서 사용할 수 있도록 내보내기
module.exports = {
    insertJsonData,
};
