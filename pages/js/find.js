document.addEventListener("DOMContentLoaded", () => {
    const searchNameInput = document.getElementById("search-name");
    const searchPhoneInput = document.getElementById("search-phone");
    const searchButton = document.getElementById("search-button");
    const resultDiv = document.getElementById("result");

    // Search for groups by name and phone
    const searchGroups = async () => {
        const nameValue = searchNameInput.value.trim();
        const phoneValue = searchPhoneInput.value.trim();

        if (!nameValue || !phoneValue) {
            resultDiv.innerHTML = `<p class="no-result">Please enter both a name and a phone number to search.</p>`;
            return;
        }

        try {
            const response = await fetch(
                `/search-group?name=${nameValue}&phone=${phoneValue}`
            );
            if (!response.ok) {
                throw new Error("Failed to search groups.");
            }
            const { groups } = await response.json();

            if (groups.length > 0) {
                resultDiv.innerHTML = `
                    <p>The person is in the following groups:</p>
                    <ul>
                        ${groups.map((group) => `<li>${group}</li>`).join("")}
                    </ul>
                `;
            } else {
                resultDiv.innerHTML = `<p class="no-result">No groups found for the provided name and phone number.</p>`;
            }
        } catch (error) {
            console.error("Error searching groups:", error);
            resultDiv.innerHTML = `<p class="no-result">An error occurred while searching for groups.</p>`;
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
