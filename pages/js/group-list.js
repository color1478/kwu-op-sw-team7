document.addEventListener("DOMContentLoaded", async () => {
    const groupListDiv = document.getElementById("group-list");
    const groupDataDiv = document.getElementById("group-data");
    const searchInput = document.getElementById("group-search");
    const searchButton = document.getElementById("search-button");
    const codePromptDiv = document.getElementById("code-prompt");
    const groupCodeInput = document.getElementById("group-code");
    const codeSubmitButton = document.getElementById("code-submit-button");
    const commentPart = document.getElementById("comment_part");
    const commentSection = document.getElementById("comment_section");

    const commentForm = document.getElementById("comment-form");
    // 현재 페이지 ID 가져오기 (URL의 쿼리 또는 경로 기반)
    pageId = "";
    commentPart.style.display = "none";

    let fetchedData = []; // 전체 데이터를 저장

    // 서버에서 데이터 가져오기
    const fetchData = async () => {
        try {
            const response = await fetch("/get-data");
            if (!response.ok) {
                throw new Error("Failed to fetch data");
            }
            return await response.json();
        } catch (error) {
            console.error("Error fetching data:", error);
            return [];
        }
    };

    const renderGroupDetails = (groupData) => {
        groupDataDiv.innerHTML = ""; // 기존 데이터 제거

        if (!groupData) {
            groupDataDiv.innerHTML = `<p>No data found for the specified group and code.</p>`;
            return;
        }

        const table = document.createElement("table");
        const thead = document.createElement("thead");
        const tbody = document.createElement("tbody");

        // 테이블 헤더 생성
        thead.innerHTML = `
        <tr>
          <th>Name</th>
          <th>Phone Number</th>
          <th>Availability</th>
        </tr>
      `;

        // 테이블 데이터 생성
        groupData.forEach((item) => {
            const row = document.createElement("tr");
            row.innerHTML = `
          <td>${item.name}</td>
          <td>${item.phone}</td>
          <td>${formatAvailability(item.availability)}</td>
        `;
            tbody.appendChild(row);
        });

        table.appendChild(thead);
        table.appendChild(tbody);
        groupDataDiv.appendChild(table);

        // "View Group Schedule" 버튼 추가
        const button = document.createElement("button");
        button.textContent = "View Group Schedule";
        button.className = "view-schedule-btn";
        button.addEventListener("click", () => {
            // URL에 group과 code를 포함하여 이동
            window.location.href = `/html/schedule.html?group=${encodeURIComponent(
                groupData[0].group
            )}&code=${encodeURIComponent(groupData[0].groupCode)}`;
        });
        groupDataDiv.appendChild(button);
    };

    const formatAvailability = (availability) => {
        const days = [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
        ];
        return Object.entries(availability)
            .map(
                ([day, hours]) =>
                    `${days[day]}: ${hours
                        .map((hour) => `${hour}:00`)
                        .join(", ")}`
            )
            .join("<br>");
    };

    const checkGroupExists = async (groupName, groupCode) => {
        try {
            const response = await fetch(
                `/check-group?group=${groupName}&code=${groupCode}`
            );
            const result = await response.json();
            return result.exists; // 서버에서 그룹 존재 여부 반환
        } catch (error) {
            console.error("Error checking group:", error);
            return false;
        }
    };

    const searchGroupByCode = async () => {
        const groupName = searchInput.value.trim().toLowerCase();
        const groupCode = groupCodeInput.value.trim();

        if (!groupName || !groupCode) {
            alert("Please enter both a group name and a group code.");
            return;
        }

        const exists = await checkGroupExists(groupName, groupCode);
        if (!exists) {
            groupListDiv.innerHTML = `<p>No group found with the specified name and code.</p>`;
            groupDataDiv.innerHTML = "";
        } else {
            renderGroupDetails(groupData);
            groupListDiv.innerHTML = `<p>Group: <strong>${groupName}</strong> found.</p>`;
            codePromptDiv.style.display = "none";
            commentPart.style.display = "block";
            pageId = groupName;
            fetchComments();
        }
    };

    // 데이터 가져와서 초기화
    fetchedData = await fetchData();

    // 검색 버튼 클릭 이벤트
    searchButton.addEventListener("click", () => {
        const groupName = searchInput.value.trim();

        if (!groupName) {
            groupListDiv.innerHTML = `<p>Please enter a group name to search.</p>`;
            groupDataDiv.innerHTML = "";
            codePromptDiv.style.display = "none";
            return;
        }
        const matchedGroups = fetchedData.filter(
            (item) => item.group.toLowerCase() === groupName.toLowerCase()
        );
        if (matchedGroups.length === 0) {
            groupListDiv.innerHTML = `<p>No group found with the specified name.</p>`;
            codePromptDiv.style.display = "none"; // 코드 입력 창 숨기기
        } else {
            groupListDiv.innerHTML = `<p>Group: <strong>${groupName}</strong>. Please enter the code to access details.</p>`;
            codePromptDiv.style.display = "block"; // 코드 입력 창 표시
        }
        groupDataDiv.innerHTML = "";
    });

    // 그룹 코드 확인 버튼 클릭 이벤트
    codeSubmitButton.addEventListener("click", searchGroupByCode);

    // Enter 키로 그룹 코드 확인
    groupCodeInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            searchGroupByCode();
        }
    });

    //----------------------------------------------
    //----------comment 기능------------------------

    // 댓글 불러오기
    const fetchComments = async () => {
        const res = await fetch(`/api/comments/${pageId}`);
        const comments = await res.json();
        commentSection.innerHTML = comments
            .map(
                (c) => `
        <div class="comment">
            <div class="username">${c.username}</div>
            <div class="time">${new Date(c.time).toLocaleString()}</div>
            <div class="text">${c.comment}</div>
        </div>
    `
            )
            .join("");
    };

    // 댓글 추가
    commentForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const username = document.getElementById("username").value;
        const comment = document.getElementById("comment").value;

        const res = await fetch(`/api/comments/${pageId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, comment }),
        });

        if (res.ok) {
            fetchComments(); // 새로고침 없이 댓글 목록 갱신
            //alert('업로드 성공!');
            commentForm.reset();
        } else {
            alert("Error adding comment.");
        }
    });
});
