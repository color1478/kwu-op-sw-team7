document.addEventListener("DOMContentLoaded", async () => {
    const maxOverlapDiv = document.getElementById("max-overlap");
    const backButton = document.getElementById("back-button");
  
    // Back button functionality
    backButton.addEventListener("click", () => {
      window.history.back(); // Navigate to the previous page
    });
  
    // Parse the group name and code from the query string
    const params = new URLSearchParams(window.location.search);
    const groupName = params.get("group");
    const groupCode = params.get("code");
  
    if (!groupName || !groupCode) {
      maxOverlapDiv.innerHTML = "<p>No group or code specified.</p>";
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
  
    const findTopOverlaps = (groupData) => {
      const schedule = Array(7).fill(null).map(() => Array(24).fill(0)); // 7 days, 24 hours
  
      // Aggregate availability
      groupData.forEach((member) => {
        Object.entries(member.availability).forEach(([day, hours]) => {
          hours.forEach((hour) => {
            schedule[day][hour]++;
          });
        });
      });
  
      // Flatten schedule and find top overlaps
      const overlaps = [];
      schedule.forEach((daySchedule, day) => {
        daySchedule.forEach((overlap, hour) => {
          if (overlap > 0) {
            overlaps.push({ day, hour, overlap });
          }
        });
      });
  
      // Sort by overlap in descending order
      overlaps.sort((a, b) => b.overlap - a.overlap);
  
      // Return overlaps
      return overlaps;
    };
  
    // Fetch and process data
    const data = await fetchData();
    const groupData = data.filter(
      (item) => item.group === groupName && item.groupCode === groupCode
    );
  
    if (groupData.length === 0) {
      maxOverlapDiv.innerHTML = "<p>No data found for this group and code.</p>";
    } else {
      const overlaps = findTopOverlaps(groupData);
  
      if (overlaps.length === 0) {
        maxOverlapDiv.innerHTML = "<p>No overlaps found.</p>";
      } else if (overlaps.length > 5) {
        maxOverlapDiv.innerHTML = `
          <h2>Top 5 Overlaps</h2>
          <ol>
            ${overlaps
              .slice(0, 5)
              .map(
                (item) =>
                  `<li>
                    <strong>${["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][item.day]}</strong> 
                    at <strong>${item.hour}:00</strong> with <strong>${item.overlap}</strong> overlaps.
                  </li>`
              )
              .join("")}
          </ol>
        `;
      } else {
        maxOverlapDiv.innerHTML = `
          <h2>Top ${overlaps.length} Overlaps</h2>
          <ol>
            ${overlaps
              .map(
                (item) =>
                  `<li>
                    <strong>${["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][item.day]}</strong> 
                    at <strong>${item.hour}:00</strong> with <strong>${item.overlap}</strong> overlaps.
                  </li>`
              )
              .join("")}
          </ol>
        `;
      }
    }
  });
  