let SurgeryTables;

populateTable = function(data) {
    // Clear the table first
    databaseItems.querySelector('tbody').innerHTML = '';

    var count = 0;

    for (var i = 0; i < data.length; i++) {
        var row = document.createElement('tr');
        // Style the row based on whether its index is even or odd
        if (count  % 2 === 0) {
            row.style.backgroundColor = '#D3D3D3';
        } else {
            row.style.backgroundColor = '#808080';
        }

        count++;

        var SurgeonCell = document.createElement('td');
        SurgeonCell.textContent = data[i].SurgeonID;

        var PatientCell = document.createElement('td');
        PatientCell.textContent = data[i].PatientID;

        var ORCell = document.createElement('td');
        ORCell.textContent = data[i].OperationTheatreNumber;

        var SurgeryTypeCell = document.createElement('td');
        SurgeryTypeCell.textContent = data[i].SurgeryTypeID;

        var DateCell = document.createElement('td');
        DateCell.textContent = data[i].SurgeryDate;

        row.appendChild(SurgeonCell);
        row.appendChild(PatientCell);
        row.appendChild(SurgeryTypeCell);
        row.appendChild(ORCell);
        row.appendChild(DateCell);
        databaseItems.querySelector('tbody').appendChild(row);
    }
}

window.onload = async function() {
    let response = await fetch('/get-surgery');
    SurgeryTables = await response.json();

    populateTable(SurgeryTables)
}