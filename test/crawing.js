// server.js
const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

// 정적 파일 제공 (HTML 파일 및 JSON 파일)
app.use(express.static(path.join(__dirname, "public")));

// Genie 차트 데이터를 가져와 JSON 파일 생성
app.get("/generate-json", async (req, res) => {
  try {
    const html = await axios.get("https://www.genie.co.kr/chart/top200", {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36",
      },
    });

    const $ = cheerio.load(html.data);
    let ulList = [];
    $("tr.list").each((i, element) => {
      ulList.push({
        rank: i + 1,
        title: $(element).find("td.info a.title").text().trim(),
        artist: $(element).find("td.info a.artist").text().trim(),
      });
    });

    // JSON 파일로 저장
    fs.writeFileSync("public/chart_data.json", JSON.stringify(ulList, null, 2));
    res.send("JSON 파일이 생성되었습니다.");
  } catch (error) {
    console.error("데이터를 가져오는 데 실패했습니다:", error);
    res.status(500).send("데이터를 가져오는 데 실패했습니다.");
  }
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT}에서 실행 중입니다.`);
});
