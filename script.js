async function fetchData() {
    try {
        const response = await fetch("/data");
        let data = await response.json();

        const uniqueData = [];
        const seen = new Set();
        for (const entry of data) {
            const key = `${entry.location}-${entry.pH}-${entry.turbidity}-${entry.temperature}`;
            if (!seen.has(key)) {
                seen.add(key);
                uniqueData.push(entry);
            }
        }
        document.getElementById("data-display").innerHTML = uniqueData.map(d => 
            `<tr>
                <td>${d.location}</td>
                <td>${d.pH}</td>
                <td>${d.turbidity}</td>
                <td>${d.temperature}</td>
            </tr>`
        ).join("");
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}
fetchData();
async function removeDuplicates() {
    try {
        const response = await fetch("/remove-duplicates", { method: "DELETE" });
        const result = await response.json();
        alert(result.message);
        fetchData(); 
    } catch (error) {
        console.error("Error removing duplicates:", error);
    }
}
