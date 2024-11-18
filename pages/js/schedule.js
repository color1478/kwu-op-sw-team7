document.addEventListener("DOMContentLoaded", async () => {
  const scheduleDiv = document.getElementById("schedule");
  const backButton = document.getElementById("back-button");

  // Back button functionality
  backButton.addEventListener("click", () => {
    window.history.back(); // Navigate to the previous page
  });

  // Parse the group name from the query string
  const params = new URLSearchParams(window.location.search);
  const groupName = params.get("group");

  if (!groupName) {
    scheduleDiv.innerHTML = "<p>No group selected.</p>";
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
    const schedule = Array(7).fill(null).map(() => Array(24).fill(0)); // 7 days, 24 hours

    // Aggregate availability
    groupData.forEach((member) => {
      Object.entries(member.availability).forEach(([day, hours]) => {
        hours.forEach((hour) => {
          schedule[day][hour]++;
        });
      });
    });

    // Create schedule table
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

    schedule.forEach((daySchedule, day) => {
      daySchedule.forEach((overlap, hour) => {
        const row = tbody.querySelector(`tr[data-hour="${hour}"]`) || document.createElement("tr");
        if (!row.hasChildNodes()) {
          row.innerHTML = `<td>${hour}:00</td>`;
          row.setAttribute("data-hour", hour);
          tbody.appendChild(row);
        }
        const cell = document.createElement("td");
        cell.textContent = overlap > 0 ? overlap : "";
        cell.setAttribute("data-overlap", overlap);
        row.appendChild(cell);
      });
    });

    table.appendChild(thead);
    table.appendChild(tbody);
    scheduleDiv.appendChild(table);
  };

  // Fetch and process data
  const data = await fetchData();
  const groupData = data.filter((item) => item.group === groupName);
  if (groupData.length === 0) {
    scheduleDiv.innerHTML = "<p>No data found for this group.</p>";
  } else {
    renderSchedule(groupData);
  }
});
