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
            cell.dataset.day = day; // 요일 저장
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
    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const name = document.getElementById("name").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const group = document.getElementById("group").value.trim();
        const groupCode = document.getElementById("group-code").value.trim();

        const availability = {};
        selectedCells.forEach((key) => {
            const [day, time] = key.split("-");
            if (!availability[day]) availability[day] = [];
            availability[day].push(parseInt(time, 10));
        });

        const newData = { name, phone, group, groupCode, availability };

        try {
            // Send the new data to the server
            await fetch("/save-data", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newData), // 새로운 데이터만 추가
            });

            alert("Data added successfully!");
            window.location.href = "/html/group-list.html"; // Redirect to group-list.html
        } catch (error) {
            console.error("Error adding data:", error);
        }
    });

    // Autofill group and group code from URL
    const urlParams = new URLSearchParams(window.location.search);
    const groupName = urlParams.get("group");
    const groupCode = urlParams.get("groupCode");

    if (groupName) {
        document.getElementById("group").value = groupName;
        document.getElementById("group").readOnly = true;
    }

    if (groupCode) {
        document.getElementById("group-code").value = groupCode;
        document.getElementById("group-code").readOnly = true;
    }

    // Phone number formatting
    const phoneInput = document.getElementById("phone");
    phoneInput.addEventListener("input", () => {
        let value = phoneInput.value.replace(/\D/g, ""); // 숫자만 남김
        if (value.length > 3 && value.length <= 7) {
            value = value.replace(/(\d{3})(\d+)/, "$1-$2");
        } else if (value.length > 7) {
            value = value.replace(/(\d{3})(\d{4})(\d+)/, "$1-$2-$3");
        }
        phoneInput.value = value;
    });

    phoneInput.addEventListener("blur", () => {
        const pattern = /^010-\d{4}-\d{4}$/;
        if (!pattern.test(phoneInput.value)) {
            alert(
                "Please enter a valid phone number in the format 010-0000-0000"
            );
            phoneInput.focus();
        }
    });
});
