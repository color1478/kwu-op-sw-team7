document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("availability-form");
  const tableBody = document.getElementById("availability-table");
  const selectedCells = new Set(); // 저장된 선택 셀
  let isDragging = false; // 드래그 상태 확인
  let isClickable = true; // 클릭 가능 여부 확인
  const delay = 700; // 딜레이 0.7초 (ms)

  // Generate the 24-hour availability table
  for (let hour = 0; hour < 24; hour++) {
    const row = document.createElement("tr");
    const timeCell = document.createElement("td");
    timeCell.textContent = `${hour}:00`;
    row.appendChild(timeCell);

    // Create 7 columns for each day
    for (let day = 0; day < 7; day++) {
      const cell = document.createElement("td");
      cell.dataset.time = hour; // 시간 저장
      cell.dataset.day = day;  // 요일 저장
      row.appendChild(cell);
    }

    tableBody.appendChild(row);
  }

  // Handle drag selection
  tableBody.addEventListener("mousedown", (e) => {
    if (isClickable && e.target.tagName === "TD" && e.target.dataset.day) {
      isDragging = true;
      toggleCellSelection(e.target);

      // Prevent immediate re-click
      isClickable = false;
      setTimeout(() => {
        isClickable = true;
      }, delay);
    }
  });

  tableBody.addEventListener("mousemove", (e) => {
    if (isDragging && e.target.tagName === "TD" && e.target.dataset.day) {
      toggleCellSelection(e.target);
    }
  });

  window.addEventListener("mouseup", () => {
    isDragging = false;
  });

  // Toggle selection state of a cell
  function toggleCellSelection(cell) {
    const cellKey = `${cell.dataset.day}-${cell.dataset.time}`;
    if (selectedCells.has(cellKey)) {
      selectedCells.delete(cellKey);
      cell.classList.remove("selected");
    } else {
      selectedCells.add(cellKey);
      cell.classList.add("selected");
    }
  }

  // Handle form submission
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = document.getElementById("name").value;
    const phone = document.getElementById("phone").value;
    const group = document.getElementById("group").value;

    const availability = {};
    selectedCells.forEach((key) => {
      const [day, time] = key.split("-");
      if (!availability[day]) availability[day] = [];
      availability[day].push(parseInt(time, 10));
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

// 뒤로가기 버튼 클릭 시 group-list.html로 이동
document.getElementById("back-button").addEventListener("click", () => {
  window.location.href = "/html/group-list.html"; // group-list.html로 이동
});
