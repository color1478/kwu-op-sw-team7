document.addEventListener("DOMContentLoaded", async () => {
    const tableBody = document.querySelector("#group-table tbody");

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

    // Load data and populate the table
    const data = await fetchData();

    if (data.length === 0) {
        console.error("No data found or failed to fetch data");
        tableBody.innerHTML = `<tr><td colspan="2">Failed to load group data</td></tr>`;
        return;
    }

    // Extract unique groups and their codes
    const uniqueGroups = {};
    data.forEach((entry) => {
        if (!uniqueGroups[entry.group]) {
            uniqueGroups[entry.group] = entry.groupCode;
        }
    });

    // Populate the table with unique group data
    Object.entries(uniqueGroups).forEach(([groupName, groupCode]) => {
        const row = document.createElement("tr");
        row.innerHTML = `
        <td>${groupName}</td>
        <td>${groupCode}</td>
      `;
        row.addEventListener("click", () =>
            openAddDataForm(groupName, groupCode)
        );
        tableBody.appendChild(row);
    });

    // Function to redirect to add-data.html with pre-filled group data
    const openAddDataForm = (group, groupCode) => {
        const url = new URL("/html/add-data.html", window.location.origin);
        url.searchParams.set("group", group);
        url.searchParams.set("groupCode", groupCode);
        window.location.href = url;
    };

    // Back button functionality
    document.getElementById("back-button").addEventListener("click", () => {
        window.location.href = "/html/index.html";
    });
});
