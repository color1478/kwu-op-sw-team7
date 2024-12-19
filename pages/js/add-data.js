document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("availability-form");
  const tableBody = document.getElementById("availability-table");
  const checkGroupButton = document.getElementById("check-group-button");
  const groupInput = document.getElementById("group");
  const selectedCells = new Set();
  let isDragging = false;
  let lastSelectedCell = null;
  let isGroupChecked = false;
  let phoneWarningShown = false;
  let isShiftKey = false;

  // 중복 확인 결과 메시지
  const groupCheckResult = document.createElement("span");
  groupCheckResult.style.marginLeft = "10px";
  groupInput.parentNode.appendChild(groupCheckResult);

  // URL 파라미터 확인
  const urlParams = new URLSearchParams(window.location.search);
  const skipCheck = urlParams.get("skipCheck");
  const groupName = urlParams.get("group");
  const groupCode = urlParams.get("groupCode");

  if (groupName) {
    groupInput.value = groupName;
    groupInput.readOnly = true;

    if (skipCheck === "true") {
      groupCheckResult.textContent = "그룹명 중복 확인이 완료되었습니다.";
      groupCheckResult.style.color = "green";
      isGroupChecked = true; // 중복 확인 완료 상태로 설정
      checkGroupButton.disabled = true; // 버튼 비활성화
    }
  }

  if (groupCode) {
    const groupCodeInput = document.getElementById("group-code");
    groupCodeInput.value = groupCode;
    groupCodeInput.readOnly = true;
  }

  // Shift 키 상태 감지
  window.addEventListener("keydown", (e) => {
    if (e.key === "Shift") isShiftKey = true;
  });
  window.addEventListener("keyup", (e) => {
    if (e.key === "Shift") isShiftKey = false;
  });

  // Generate the 24-hour availability table
  for (let hour = 0; hour < 24; hour++) {
    const row = document.createElement("tr");
    const timeCell = document.createElement("td");
    timeCell.textContent = `${hour}:00`;
    row.appendChild(timeCell);

    for (let day = 0; day < 7; day++) {
      const cell = document.createElement("td");
      cell.dataset.time = hour;
      cell.dataset.day = day;
      row.appendChild(cell);
    }
    tableBody.appendChild(row);
  }

  // Handle cell selection
  tableBody.addEventListener("mousedown", (e) => {
    if (e.target.tagName === "TD" && e.target.dataset.day) {
      isDragging = true;
      if (isShiftKey && lastSelectedCell) {
        deselectRange(lastSelectedCell, e.target);
      } else {
        activateCellSelection(e.target);
      }
      lastSelectedCell = e.target;
    }
  });

  tableBody.addEventListener("mousemove", (e) => {
    if (isDragging && e.target.tagName === "TD" && e.target.dataset.day) {
      if (isShiftKey && lastSelectedCell) {
        deselectRange(lastSelectedCell, e.target);
      } else {
        activateCellSelection(e.target);
      }
    }
  });

  window.addEventListener("mouseup", () => {
    isDragging = false;
    lastSelectedCell = null;
  });

  // Activate cell selection
  function activateCellSelection(cell) {
    const cellKey = `${cell.dataset.day}-${cell.dataset.time}`;
    if (!selectedCells.has(cellKey)) {
      selectedCells.add(cellKey);
      cell.classList.add("selected");
    }
  }

  // Deselect a range of cells
  function deselectRange(startCell, endCell) {
    const startDay = parseInt(startCell.dataset.day, 10);
    const endDay = parseInt(endCell.dataset.day, 10);
    const startTime = parseInt(startCell.dataset.time, 10);
    const endTime = parseInt(endCell.dataset.time, 10);

    const minDay = Math.min(startDay, endDay);
    const maxDay = Math.max(startDay, endDay);
    const minTime = Math.min(startTime, endTime);
    const maxTime = Math.max(startTime, endTime);

    for (let day = minDay; day <= maxDay; day++) {
      for (let time = minTime; time <= maxTime; time++) {
        const cell = tableBody.querySelector(`td[data-day="${day}"][data-time="${time}"]`);
        if (cell) {
          const cellKey = `${day}-${time}`;
          if (selectedCells.has(cellKey)) {
            selectedCells.delete(cellKey);
            cell.classList.remove("selected");
          }
        }
      }
    }
  }

  // Handle group duplication check
  checkGroupButton.addEventListener("click", async () => {
    const groupName = groupInput.value.trim();
    groupCheckResult.textContent = "";

    if (!groupName) {
      groupCheckResult.textContent = "그룹명을 입력해주세요.";
      groupCheckResult.style.color = "red";
      return;
    }

    try {
      const response = await fetch(`/check-group?group=${encodeURIComponent(groupName)}`);
      const { exists } = await response.json();

      if (exists) {
        groupCheckResult.textContent = "그룹명이 이미 존재합니다.";
        groupCheckResult.style.color = "red";
        isGroupChecked = false;
      } else {
        groupCheckResult.textContent = "사용 가능한 그룹명입니다.";
        groupCheckResult.style.color = "green";
        isGroupChecked = true;
      }
    } catch (error) {
      console.error("Error checking group name:", error);
      groupCheckResult.textContent = "오류가 발생했습니다. 다시 시도해주세요.";
      groupCheckResult.style.color = "red";
      isGroupChecked = false;
    }
  });

  // Handle form submission
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!isGroupChecked) {
      alert("그룹명 중복 확인을 완료해주세요.");
      return;
    }

    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const group = groupInput.value.trim();
    const groupCode = document.getElementById("group-code").value.trim();

    const availability = {};
    selectedCells.forEach((key) => {
      const [day, time] = key.split("-");
      if (!availability[day]) availability[day] = [];
      availability[day].push(parseInt(time, 10));
    });

    const newData = { name, phone, group, groupCode, availability, creator: true };

    try {
      const response = await fetch("/save-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newData),
      });

      if (response.ok) {
        alert("Data saved successfully!");
        window.location.href = "/html/group-list.html";
      } else {
        alert("Failed to save data.");
      }
    } catch (error) {
      console.error("Error saving data:", error);
      alert("오류가 발생했습니다. 데이터를 저장할 수 없습니다.");
    }
  });

  // Phone number formatting
  const phoneInput = document.getElementById("phone");
  phoneInput.addEventListener("input", () => {
    phoneWarningShown = false;
    let value = phoneInput.value.replace(/\D/g, "");
    if (value.length > 3 && value.length <= 7) {
      value = value.replace(/(\d{3})(\d+)/, "$1-$2");
    } else if (value.length > 7) {
      value = value.replace(/(\d{3})(\d{4})(\d+)/, "$1-$2-$3");
    }
    phoneInput.value = value;
  });

  phoneInput.addEventListener("blur", () => {
    const pattern = /^010-\d{4}-\d{4}$/;
    if (!pattern.test(phoneInput.value) && !phoneWarningShown) {
      phoneWarningShown = true;
      alert("Please enter a valid phone number in the format 010-0000-0000");
      phoneInput.value = "";
      phoneInput.focus();
    }
  });
});
