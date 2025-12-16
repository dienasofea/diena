// run JavaScript only after the HTML page has fully loaded ** AI assisted code **
window.onload = function () {

    // 1. Define Multi-Dimensional Array studentData
    // Each record contains: [Student Name, Credit Hours, Current GPA]
    let studentData = [
        ["Ali bin Ahmad", 15, 3.75],
        ["Bala A/L Muthu", 12, 3.40],
        ["Siti Nurhaliza", 18, 4.00],
        ["Wong Mei Ling", 10, 3.50],
        ["David Lee", 15, 2.95]
    ];

    // Get the output container
    let output = document.getElementById("output");

    // 2. Function to check Dean's List eligibility
    // Eligible if credit hours >= 12 AND GPA >= 3.5
    function checkDeanList(credit, gpa) {
        if (credit >= 12 && gpa >= 3.5) {
            return "<span class='eligible'>Eligible for Dean's List</span>";
        } else {
            return "<span class='not-eligible'>Not Eligible</span>";
        }
    }

    // 3. Display existing student records using for loop
    for (let i = 0; i < studentData.length; i++) {

        let name = studentData[i][0];
        let credit = studentData[i][1];
        let gpa = studentData[i][2];

        let status = checkDeanList(credit, gpa);

        output.innerHTML += `
            <div>
                <b>Name:</b> ${name}<br>
                <b>Current GPA:</b> ${gpa}<br>
                <b>Status:</b> ${status}<br>
                <hr style="border-top: 1px dotted #ccc;">
            </div>
        `;
    }

    // 4. Function to add a new student record from the form
    window.addStudent = function () {

        let name = document.getElementById("name").value;
        let credit = Number(document.getElementById("credit").value);
        let gpa = Number(document.getElementById("gpa").value);

        // Validate input fields
        if (name === "" || credit === 0 || gpa === 0) {
            alert("Please fill in all fields");
            return;
        }

        // Add new student data into the array
        studentData.push([name, credit, gpa]);

        // Check eligibility for the new student
        let status = checkDeanList(credit, gpa);

        // Display newly added student information
        output.innerHTML += `
            <div>
                <b>Name:</b> ${name}<br>
                <b>Current GPA:</b> ${gpa}<br>
                <b>Status:</b> ${status}<br>
                <hr style="border-top: 1px dotted #ccc;">
            </div>
        `;

        // Clear input fields after adding
        document.getElementById("name").value = "";
        document.getElementById("credit").value = "";
        document.getElementById("gpa").value = ""; 
    };
};
