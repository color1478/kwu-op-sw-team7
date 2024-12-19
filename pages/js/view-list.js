document.addEventListener("DOMContentLoaded", async () => {
    const tableBody = document.querySelector("#group-table tbody");
    const searchInput = document.getElementById("search-input");
    const searchButton = document.getElementById("search-button");
  
    // Fetch group data from /get-data API
    const fetchData = async () => {
        try {
            const response = await fetch("/get-data");
            if (!response.ok) {
                throw new Error("Failed to fetch data");
            }
            return await response.json(); // Parse and return JSON data
        } catch (error) {
            console.error("Error fetching data:", error);
            return [];
        }
    };
  
    let originalData = [];
  
    // Render table rows based on data
    const renderTable = (data) => {
        tableBody.innerHTML = "";
        if (data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="2">No matching groups found</td></tr>`;
            return;
        }
  
        const uniqueGroups = {};
        data.forEach((entry) => {
            if (!uniqueGroups[entry.group]) {
                uniqueGroups[entry.group] = { groupCode: entry.groupCode, creator: "" };
            }
            if (entry.creator === true) {
                const name = entry.name;
                const maskedName = name.length > 2
                    ? name[0] + "*".repeat(name.length - 2) + name[name.length - 1]
                    : name[0] + "*";
                uniqueGroups[entry.group].creator = maskedName;
            }
        });
  
        Object.entries(uniqueGroups).forEach(([groupName, { groupCode, creator }]) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${groupName}</td>
                <td>${creator}</td>
            `;
            row.addEventListener("click", () => promptGroupCode(groupName, groupCode));
            tableBody.appendChild(row);
        });
    };
  
    // Load data and initialize the table
    const data = await fetchData();
    originalData = data;
    renderTable(data);
  
    // Search functionality
    searchButton.addEventListener("click", () => {
        const searchValue = searchInput.value.trim().toLowerCase();
        const filteredData = originalData.filter(entry =>
            entry.group.toLowerCase().includes(searchValue)
        );
        renderTable(filteredData);
    });
  
    // Prompt for group code and validate
    const promptGroupCode = (group, groupCode) => {
        const userCode = prompt(`그룹 '${group}'에 가입하려면 가입 코드를 입력하세요:`);
  
        if (userCode === null) {
            // User canceled the prompt
            return;
        }
  
        if (userCode === groupCode) {
            redirectToAddDataForm(group, groupCode);
        } else {
            alert("가입 코드가 올바르지 않습니다. 다시 시도해주세요.");
        }
    };

    const redirectToAddDataForm = (group, groupCode) => {
        const url = new URL("/html/add-data.html", window.location.origin);
        url.searchParams.set("group", group);
        url.searchParams.set("groupCode", groupCode);
        url.searchParams.set("skipCheck", "true"); // 중복 확인 생략 플래그 추가
        window.location.href = url;
    };
    

    // Back button functionality
    document.getElementById("back-button").addEventListener("click", () => {
        window.location.href = "/html/index.html";
    });
});
