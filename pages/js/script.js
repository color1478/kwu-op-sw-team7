document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("availability-form");
    const tableBody = document.getElementById("availability-table");
  
    // Generate the 24-hour availability table
    for (let hour = 0; hour < 24; hour++) {
      const row = document.createElement("tr");
      const timeCell = document.createElement("td");
      timeCell.textContent = `${hour}:00`;
      row.appendChild(timeCell);
  
      // Create 7 columns for each day
      for (let day = 0; day < 7; day++) {
        const cell = document.createElement("td");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.name = "availability";
        checkbox.value = `${hour}-${day}`;
        cell.appendChild(checkbox);
        row.appendChild(cell);
      }
  
      tableBody.appendChild(row);
    }
  
    // Handle form submission
    form.addEventListener("submit", (event) => {
      event.preventDefault();
  
      const name = document.getElementById("name").value;
      const phone = document.getElementById("phone").value;
      const group = document.getElementById("group").value;
  
      const checkboxes = document.querySelectorAll('input[name="availability"]:checked');
      const availability = {};
  
      checkboxes.forEach((checkbox) => {
        const [hour, day] = checkbox.value.split("-").map(Number);
        if (!availability[day]) availability[day] = [];
        availability[day].push(hour);
      });
  
      const data = { name, phone, group, availability };
  
      // Send data to server
      fetch("/save-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
        .then((response) => response.text())
        .then((message) => {
          alert(message); // Show success message
          window.location.href = "/html/group-list.html"; // Redirect to group-list.html
        })
        .catch((error) => console.error("Error:", error));
    });
  });
  