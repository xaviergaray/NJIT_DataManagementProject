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
    // Get the selected values from the dropdown filters
    var selectedSurgeon = document.getElementById('surgeon').value;
    var selectedPatient = document.getElementById('patient').value;
    var selectedOR = document.getElementById('operating-theater-list').value;
    var rangeCheckbox = document.getElementById('rangeCheckbox').checked;
    var dateStart = new Date(document.getElementById('dateStart').value);
    var dateEnd = new Date(document.getElementById('dateEnd').value);


    // Clear the table first
    databaseItems.querySelector('tbody').innerHTML = '';

    var count = 0;

    for (var i = 0; i < SurgeryTables.length; i++) {
        var surgeryDate = new Date(SurgeryTables[i].SurgeryDate);

        // TODO: Make dates compare only days, not times
        // Check if the surgery matches the selected filters
        if ((selectedSurgeon === '' || SurgeryTables[i].SurgeonID == selectedSurgeon) &&
            (selectedPatient === '' || SurgeryTables[i].PatientID == selectedPatient) &&
            (selectedOR === '' || SurgeryTables[i].OperationTheatreNumber == selectedOR) &&
            (!rangeCheckbox || (surgeryDate >= dateStart && (dateEnd ? surgeryDate <= dateEnd : true))))
        {
            console.log(surgeryDate);
            console.log(dateStart);
            console.log(dateEnd);
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

            var formattedDate = surgeryDate.toLocaleString('en-US', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
              second: 'numeric'
            });
            var DateCell = document.createElement('td');
            DateCell.textContent = formattedDate;

            row.appendChild(SurgeonCell);
            row.appendChild(PatientCell);
            row.appendChild(SurgeryTypeCell);
            row.appendChild(ORCell);
            row.appendChild(DateCell);
            databaseItems.querySelector('tbody').appendChild(row);
        }
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
        var idString = dropdownId + 'ID';
        var capitalizedIdString = idString.charAt(0).toUpperCase() + idString.slice(1);
        var IDs = new Set(SurgeryTables.map(surgery => surgery[capitalizedIdString]));
        data.forEach(item => {
            if (IDs.has(item.ID)) {
                var option = document.createElement('option');
                option.value = item.ID;
                option.textContent = item.Name;
                dropdown.appendChild(option);
            }
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

    dateStart.addEventListener('change', function() {
        dateEnd.value = dateEnd.value > dateStart.value ? dateEnd.value : dateStart.value;
        populateTable();
    });

    dateEnd.addEventListener('change', function() {
        if(!(dateEnd.value >= dateStart.value)) {
            dateEnd.value = dateStart.value;
            alert('End Date can not be before Start Date');
        }
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

    // Add event listeners to the sort buttons
    var sortButtons = document.querySelectorAll('.sort-btn');
    sortButtons.forEach(function(btn) {
        btn.ascending = true;  // Variable to toggle the sort order

        btn.addEventListener('click', function() {
            var sortField = this.dataset.sort;

            // If this is the first click, set ascending to true
            if (btn.ascending === true) {
                btn.ascending = false;
            } else {
                btn.ascending = true;
            }

            // TODO: Sort the data
            if (sortField === 'Surgeon') {
                SurgeryTables.sort((a, b) => btn.ascending ? getName(a.SurgeonID, 'surgeon').localeCompare(getName(b.SurgeonID, 'surgeon')) : getName(b.SurgeonID, 'surgeon').localeCompare(getName(a.SurgeonID, 'surgeon')));
            } else if (sortField === 'Patient') {
                SurgeryTables.sort((a, b) => btn.ascending ? getName(a.PatientID, 'patient').localeCompare(getName(b.PatientID, 'patient')) : getName(b.PatientID, 'patient').localeCompare(getName(a.PatientID, 'patient')));
            } else if (sortField === 'Surgery') {
                SurgeryTables.sort((a, b) => btn.ascending ? getName(a.SurgeryTypeID, 'type').localeCompare(getName(b.SurgeryTypeID, 'type')) : getName(b.SurgeryTypeID, 'type').localeCompare(getName(a.SurgeryTypeID, 'type')));
            } else if (sortField === 'OR') {
                SurgeryTables.sort((a, b) => btn.ascending ? a.OperationTheatreNumber.localeCompare(b.OperationTheatreNumber) : b.OperationTheatreNumber.localeCompare(a.OperationTheatreNumber));
            } else if (sortField === 'Date') {
                SurgeryTables.sort((a, b) => {
                    // Parse the dates using Date.parse()
                    var dateA = Date.parse(a.SurgeryDate);
                    var dateB = Date.parse(b.SurgeryDate);

                    // Compare the timestamps
                    return btn.ascending ? dateA - dateB : dateB - dateA;
                });
            }

            // Change the icon
            var icon = this.querySelector('i');
            if (btn.ascending) {
                icon.className = 'fas fa-sort-up';
            } else {
                icon.className = 'fas fa-sort-down';
            }

            // Reset the icons and sort order of the other columns
            var otherButtons = document.querySelectorAll('.sort-btn:not([data-sort="' + sortField + '"])');
            otherButtons.forEach(function(otherBtn) {
                var otherIcon = otherBtn.querySelector('i');
                otherIcon.className = 'fas fa-sort';
                otherBtn.ascending = true;  // Reset the sort order
            });

            // Repopulate the table with the sorted data
            populateTable();
        });
    });
}