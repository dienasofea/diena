// 1. Define Multi-Dimensional Array studentData
// Format: [Name (String), Credit Hour (Number), Current GPA (Number)]
let studentData = [
    ["Ali bin Ahmad", 15, 3.75],
    ["Bala A/L Muthu", 12, 3.40],
    ["Siti Nurhaliza", 18, 4.00],
    ["Wong Mei Ling", 10, 3.50],
    ["David Lee", 15, 2.95]
];

// 2. Function to measure dean list eligibility
function checkDeanList(credit, gpa) {
    if (credit >= 15 && gpa >= 3.5) {
        return "<span class='eligible'>Eligible</span>";
    } else {
        return "<span class='not-eligible'>Not Eligible</span>";
    }
}

// 3. Create Looping (for loop)
for (let i = 0; i < studentData.length; i++) {

    // Retrieve student data from the array
    let name = studentData[i][0];
    let credit = studentData[i][1];
    let gpa = studentData[i][2];

    // Check eligibility status using function
    let status = checkDeanList(credit, gpa);

    // 4. Print output (inside loop)
     output.innerHTML += `
        <div>
            <b>Name:</b> ${name}<br>
            <b>Current GPA:</b> ${gpa}<br>
            <b>Status:</b> ${status}<br>
            <hr style="border-top: 1px dotted #ccc;">
        </div>
`;}
