document.addEventListener("DOMContentLoaded", () => {
    const searchNameInput = document.getElementById("search-name");
    const searchPhoneInput = document.getElementById("search-phone");
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

    // Search for groups by name and phone
    const searchGroups = async () => {
        const nameValue = searchNameInput.value.trim().toLowerCase();
        const phoneValue = searchPhoneInput.value.trim();

        if (!nameValue || !phoneValue) {
            resultDiv.innerHTML = `<p class="no-result">Please enter both a name and a phone number to search.</p>`;
            return;
        }

        const data = await fetchData();

        // Filter groups where name and phone match
        const matchedGroups = data.filter(
            (item) =>
                item.name.toLowerCase() === nameValue &&
                item.phone === phoneValue
        );

        if (matchedGroups.length > 0) {
            const groupNames = matchedGroups.map((item) => item.group);
            const uniqueGroups = [...new Set(groupNames)];
            resultDiv.innerHTML = `
        <p>The person is in the following groups:</p>
        <ul>
            ${uniqueGroups.map((group) => `<li>${group}</li>`).join("")}
        </ul>
        `;
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
});
