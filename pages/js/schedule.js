document.addEventListener("DOMContentLoaded", async () => {
  const scheduleDiv = document.getElementById("schedule");
  const backButton = document.getElementById("back-button");
  const reverseButton = document.getElementById("reverse-btn");
  const filterButton = document.getElementById("filter-button");
  const filterPanel = document.getElementById("filter-panel");
  const memberListDiv = document.getElementById("member-list");
  const applyFilterButton = document.getElementById("apply-filter");

  // Parse the group name and code from the query string
  const params = new URLSearchParams(window.location.search);
  const groupName = params.get("group");
  const groupCode = params.get("code");

  // Back button functionality
  backButton.addEventListener("click", () => {
    window.history.back(); // Navigate to the previous page
  });

  // Toggle filter panel visibility
  filterButton.addEventListener("click", () => {
    filterPanel.classList.toggle("visible");
  });

  if (!groupName || !groupCode) {
    scheduleDiv.innerHTML = "<p>No group or code specified.</p>";
    return;
  }

  // Fetch data from the server
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

  const renderSchedule = (groupData) => {
    const schedule = Array(7).fill(null).map(() => Array(24).fill(0));
    const maxGroupSize = groupData.length;

    // Aggregate availability
    groupData.forEach((member) => {
      Object.entries(member.availability).forEach(([day, hours]) => {
        hours.forEach((hour) => {
          schedule[day][hour]++;
        });
      });
    });

    const table = document.createElement("table");
    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");

    thead.innerHTML = `
      <tr>
        <th>Time</th>
        ${["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
          .map((day) => `<th>${day}</th>`)
          .join("")}
      </tr>
    `;

    schedule[0].forEach((_, hour) => {
      const row = document.createElement("tr");
      row.innerHTML = `<td>${hour}:00</td>`;
      schedule.forEach((daySchedule) => {
        const overlap = daySchedule[hour];
        const cell = document.createElement("td");
        cell.textContent = overlap > 0 ? overlap : "";
        cell.setAttribute("data-overlap", overlap); // Assign overlap value
        setCellColor(cell, overlap); // Apply initial color
        row.appendChild(cell);
      });
      tbody.appendChild(row);
    });

    table.appendChild(thead);
    table.appendChild(tbody);
    scheduleDiv.innerHTML = ""; // Clear loading message
    scheduleDiv.appendChild(table);

    // Add "Find Maximum Overlap" button
    const maxButton = document.createElement("button");
    maxButton.textContent = "Find Maximum Overlap";
    maxButton.className = "find-max-btn";
    maxButton.addEventListener("click", () => {
      window.location.href = `/html/max-overlap.html?group=${encodeURIComponent(groupName)}&code=${encodeURIComponent(groupCode)}`;
    });
    scheduleDiv.appendChild(maxButton); // Append the button after the table

    // Add reverse functionality
    reverseButton.addEventListener("click", () => {
      reverseSchedule(table, maxGroupSize);
    });
  };

  const reverseSchedule = (table, maxGroupSize) => {
    const cells = table.querySelectorAll("td[data-overlap]");
    cells.forEach((cell) => {
      const overlap = parseInt(cell.getAttribute("data-overlap") || "0", 10);
      const reversed = maxGroupSize - overlap;

      // Update cell content and attributes
      cell.textContent = reversed > 0 ? reversed : "";
      cell.setAttribute("data-overlap", reversed);

      // Update cell color
      setCellColor(cell, reversed);
    });
  };

  const setCellColor = (cell, overlap) => {
    // Reset styles
    cell.style.color = "";
    cell.style.backgroundColor = "";

    // Apply color based on overlap
    if (overlap === 0) {
      cell.style.backgroundColor = "#f8f9fa"; // Default
    } else if (overlap === 1) {
      cell.style.backgroundColor = "#d4edda"; // Light green
    } else if (overlap === 2) {
      cell.style.backgroundColor = "#c3e6cb"; // Medium green
    } else if (overlap === 3) {
      cell.style.backgroundColor = "#81c784"; // Dark green
    } else if (overlap >= 4) {
      cell.style.backgroundColor = "#388e3c"; // Very dark green
      cell.style.color = "white"; // Ensure text visibility
    }
  };

  const renderFilterPanel = (members) => {
    memberListDiv.innerHTML = ""; // Clear previous members
    members.forEach((member) => {
      const label = document.createElement("label");
      label.innerHTML = `
        <input type="checkbox" class="member-checkbox" value="${member.name}" checked />
        ${member.name}
      `;
      memberListDiv.appendChild(label);
      memberListDiv.appendChild(document.createElement("br"));
    });
  };

  const applyFilter = (groupData) => {
    const checkedMembers = Array.from(
      document.querySelectorAll(".member-checkbox:checked")
    ).map((checkbox) => checkbox.value);

    const filteredData = groupData.filter((member) =>
      checkedMembers.includes(member.name)
    );

    renderSchedule(filteredData);
    filterPanel.classList.remove("visible");
  };

  const data = await fetchData();
  const groupData = data.filter(
    (item) => item.group === groupName && item.groupCode === groupCode
  );

  if (groupData.length === 0) {
    scheduleDiv.innerHTML = "<p>No data found for this group and code.</p>";
  } else {
    renderSchedule(groupData);
    renderFilterPanel(groupData);
  }

  applyFilterButton.addEventListener("click", () => {
    applyFilter(groupData);
  });
});
