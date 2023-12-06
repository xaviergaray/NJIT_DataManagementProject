let SurgeryTables;
let SurgeryTypes;
let Patients;
let Surgeons;
let Employees;

getName = function(ID, Table) {
    if (Table === 'patient') {
        return Patients.find(p => p.ID === ID).Name;
    }
    else if (Table === 'surgeon') {
        return Employees.find(p => p.ID === ID).Name;
    }
    else if (Table ==='type') {
        return SurgeryTypes.find(p => p.ID === ID).Name;
    }
    else {
        console.log('Error: Table not found')
    }
}

populateTable = function() {
    // Clear the table first
    databaseItems.querySelector('tbody').innerHTML = '';

    var count = 0;

    for (var i = 0; i < SurgeryTables.length; i++) {
        var row = document.createElement('tr');
        // Style the row based on whether its index is even or odd
        if (count  % 2 === 0) {
            row.style.backgroundColor = '#D3D3D3';
        } else {
            row.style.backgroundColor = '#808080';
        }

        count++;

        var SurgeonCell = document.createElement('td');
        SurgeonCell.textContent = getName(SurgeryTables[i].SurgeonID, 'surgeon');

        var PatientCell = document.createElement('td');
        PatientCell.textContent = getName(SurgeryTables[i].PatientID, 'patient');

        var ORCell = document.createElement('td');
        ORCell.textContent = SurgeryTables[i].OperationTheatreNumber;

        var SurgeryTypeCell = document.createElement('td');
        SurgeryTypeCell.textContent = getName(SurgeryTables[i].SurgeryTypeID, 'type');

        var DateCell = document.createElement('td');
        DateCell.textContent = SurgeryTables[i].SurgeryDate;


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

    response = await fetch('/get-surgery-types');
    SurgeryTypes = await response.json();

    response = await fetch('/get-surgeon');
    Surgeons = await response.json();

    response = await fetch('/get-patients');
    Patients = await response.json();

    response = await fetch('/get-employees');
    Employees = await response.json();

    populateTable()
}