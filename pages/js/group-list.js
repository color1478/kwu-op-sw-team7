document.addEventListener("DOMContentLoaded", async () => {
  const groupListDiv = document.getElementById("group-list");
  const groupDataDiv = document.getElementById("group-data");
  const backButton = document.getElementById("back-button");

  let selectedGroup = null; // 선택된 그룹 저장

  // 뒤로가기 버튼 기능
  backButton.addEventListener("click", () => {
    window.location.href = "/index.html"; // index.html로 이동
  });

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

  const renderGroupList = (groups) => {
    groupListDiv.innerHTML = "";
    const uniqueGroups = [...new Set(groups.map((item) => item.group))];
    uniqueGroups.forEach((group) => {
      const groupElement = document.createElement("div");
      groupElement.textContent = group;
      groupElement.classList.add("group");
      groupElement.style.cursor = "pointer";
      groupElement.style.color = "blue";
      groupElement.style.textDecoration = "underline";
      groupElement.addEventListener("click", () => {
        selectedGroup = group;
        renderGroupDetails(group, groups);
      });
      groupListDiv.appendChild(groupElement);
    });
  };

  const renderGroupDetails = (group, data) => {
    groupDataDiv.innerHTML = ""; // 기존 데이터 제거
    const groupData = data.filter((item) => item.group === group);

    if (groupData.length === 0) {
      groupDataDiv.innerHTML = `<p>No data found for group: ${group}</p>`;
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
      window.location.href = `/html/schedule.html?group=${encodeURIComponent(group)}`;
    });
    groupDataDiv.appendChild(button);
  };

  const formatAvailability = (availability) => {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    return Object.entries(availability)
      .map(([day, hours]) => `${days[day]}: ${hours.map((hour) => `${hour}:00`).join(", ")}`)
      .join("<br>");
  };

  // 데이터 가져와서 렌더링
  const data = await fetchData();
  if (data.length === 0) {
    groupListDiv.innerHTML = "<p>No groups found.</p>";
  } else {
    renderGroupList(data);
  }
});
