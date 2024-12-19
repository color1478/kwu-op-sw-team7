document.addEventListener("DOMContentLoaded", () => {
  const searchNameInput = document.getElementById("search-name");
  const searchPhoneInput = document.getElementById("search-phone");
  const searchGroupInput = document.getElementById("search-group");
  const searchButton = document.getElementById("search-button");
  const resultDiv = document.getElementById("result");

  // Fetch data from server
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

  // Search for groups
  const searchGroups = async () => {
      const nameValue = searchNameInput.value.trim().toLowerCase();
      const phoneValue = searchPhoneInput.value.trim();
      const groupValue = searchGroupInput.value.trim().toLowerCase();

      if (!nameValue || !phoneValue) {
          resultDiv.innerHTML = `<p class="no-result">Please enter both a name and a phone number to search.</p>`;
          return;
      }

      const data = await fetchData();

      // Filter groups based on phone number and name
      const matchedGroups = data.filter(
          (item) =>
              item.phone === phoneValue &&
              item.name.toLowerCase() === nameValue
      );

      if (matchedGroups.length > 0) {
          const groupNames = matchedGroups.map((item) => item.group);
          const uniqueGroups = [...new Set(groupNames)];

          if (!groupValue) {
              // If only name and phone match, show group list
              resultDiv.innerHTML = `
                  <p>The person is in the following groups:</p>
                  <ul>
                      ${uniqueGroups.map((group) => `<li>${group}</li>`).join("")}
                  </ul>
              `;
          } else {
              // If name, phone, and group name all match, show group code
              const matchedGroup = matchedGroups.find(
                  (item) => item.group.toLowerCase() === groupValue
              );

              if (matchedGroup) {
                  resultDiv.innerHTML = `
                      <p>The person is in the group <strong>${matchedGroup.group}</strong>.</p>
                      <p>Group Code: <strong>${matchedGroup.groupCode}</strong></p>
                  `;
              } else {
                  resultDiv.innerHTML = `<p class="no-result">No matching group found for the provided name, phone number, and group name.</p>`;
              }
          }
      } else {
          resultDiv.innerHTML = `<p class="no-result">No groups found for the provided name and phone number.</p>`;
      }
  };

  // Attach event listeners
  searchButton.addEventListener("click", searchGroups);

  searchNameInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
          e.preventDefault();
          searchGroups();
      }
  });

  searchPhoneInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
          e.preventDefault();
          searchGroups();
      }
  });

  searchGroupInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
          e.preventDefault();
          searchGroups();
      }
  });
});
