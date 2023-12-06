let SurgeryTables;
let SurgeryTypes;
let Patients;
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

function populateDropdown(dropdownId, data) {
    // Get the dropdown element
    var dropdown = document.getElementById(dropdownId);

    // Clear the dropdown
    dropdown.innerHTML = '';

    var defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = '';
    dropdown.appendChild(defaultOption);

    // Create an option element for each item in the data array
    if (dropdownId === 'operating-theater-list') {

        data.forEach(item => {
            var option = document.createElement('option');
            option.value = item.OperationTheatreNumber;
            option.textContent = item.OperationTheatreNumber;
            dropdown.appendChild(option);
        });
    } else
    {
        data.forEach(item => {
            var option = document.createElement('option');
            option.value = item.ID;
            option.textContent = item.Name;
            dropdown.appendChild(option);
        });
    }
}

window.onload = async function() {
    let response = await fetch('/get-surgery');
    SurgeryTables = await response.json();

    response = await fetch('/get-surgery-types');
    SurgeryTypes = await response.json();

    response = await fetch('/get-patients');
    Patients = await response.json();

    response = await fetch('/get-employees');
    Employees = await response.json();

    await populateDropdown('patient', Patients)
    await populateDropdown('surgeon', Employees)
    await populateDropdown('operating-theater-list', SurgeryTables)

    populateTable()

    var surgeonFilter = document.getElementById('surgeon');
    var patientFilter = document.getElementById('patient');
    var ORFilter = document.getElementById('operating-theater-list');
    var dateStartLabel = document.querySelector('label[for="dateStart"]');
    var dateStart = document.getElementById('dateStart');
    var rangeCheckbox = document.getElementById('rangeCheckbox');
    var dateEnd = document.getElementById('dateEnd');
    var resetFiltersButton = document.getElementById('reset');

    surgeonFilter.addEventListener('change', function() {
        populateTable();
    });

    patientFilter.addEventListener('change', function() {
        populateTable();
    });

    ORFilter.addEventListener('change', function() {
        populateTable();
    });

    rangeCheckbox.addEventListener('change', function() {
        dateEnd.disabled = !this.checked;
        dateStart.disabled = !this.checked;
        populateTable();
    });

    // Reset filters
    resetFiltersButton.addEventListener('click', function() {
        surgeonFilter.value = '0';
        patientFilter.value = '0';
        ORFilter.value = '0';
        rangeCheckbox.checked = false;
        dateStart.value = null;
        dateStart.disabled = true;
        dateEnd.value = null;
        dateEnd.disabled = true;
        populateTable();
    });
}