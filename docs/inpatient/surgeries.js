let SurgeryTables;
let SurgeryTypes;
let Patients;
let Employees;

getName = function(ID, Table) {
    var name;
    if (Table === 'patient') {
        name = Patients.find(p => p.ID === ID).Name;
    }
    else if (Table === 'surgeon') {
        name = Employees.find(p => p.ID === ID).Name;
    }
    else if (Table ==='type') {
        name = SurgeryTypes.find(p => p.ID === ID).Name;
    }
    else {
        console.log('Error: Table not found');
    }

    return name;
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

        // Check if the surgery matches the selected filters
        if ((selectedSurgeon === '' || SurgeryTables[i].SurgeonID == selectedSurgeon) &&
            (selectedPatient === '' || SurgeryTables[i].PatientID == selectedPatient) &&
            (selectedOR === '' || SurgeryTables[i].OperationTheatreNumber == selectedOR) &&
            (!rangeCheckbox || (surgeryDate >= dateStart && (dateEnd ? surgeryDate <= dateEnd : true))))
        {
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

            var formattedDate = surgeryDate.toGMTString();

            var DateCell = document.createElement('td');
            DateCell.textContent = formattedDate;

            row.appendChild(SurgeonCell);
            row.appendChild(PatientCell);
            row.appendChild(SurgeryTypeCell);
            row.appendChild(ORCell);
            row.appendChild(DateCell);
            databaseItems.querySelector('tbody').appendChild(row);

            // Ellipsis button
            var ellipsisCell = document.createElement('td');
            var ellipsisButton = document.createElement('button');
            ellipsisButton.textContent = '...';
            ellipsisButton.style.backgroundColor = '#007BFF';
            ellipsisButton.style.color = 'white';
            ellipsisButton.style.border = 'none';
            ellipsisButton.style.padding = '5px 10px';
            ellipsisButton.style.borderRadius = '5px';
            ellipsisButton.style.cursor = 'pointer';
            ellipsisCell.appendChild(ellipsisButton);
            row.appendChild(ellipsisCell);
            ellipsisButton.addEventListener('click', (function(i, SurgeryTables) {
                return function() {
                    // Create a modal backdrop
                    var backdrop = document.createElement('div');
                    backdrop.style.position = 'fixed';
                    backdrop.style.top = '0';
                    backdrop.style.left = '0';
                    backdrop.style.width = '100%';
                    backdrop.style.height = '100%';
                    backdrop.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
                    backdrop.style.zIndex = '1000';

                    // Create a dialogue box
                    var dialogBox = document.createElement('div');
                    dialogBox.style.position = 'fixed';
                    dialogBox.style.top = '50%';
                    dialogBox.style.left = '50%';
                    dialogBox.style.transform = 'translate(-50%, -50%)';
                    dialogBox.style.backgroundColor = 'white';
                    dialogBox.style.border = '1px solid black';
                    dialogBox.style.padding = '10px';
                    dialogBox.style.zIndex = '1001';

                    // Create a labels
                    var label = document.createElement('p');
                    label.textContent = 'Patient: ' + getName(SurgeryTables[i].PatientID, 'patient');
                    dialogBox.appendChild(label);
                    label = document.createElement('p');
                    label.textContent = 'Surgery: ' + getName(SurgeryTables[i].SurgeryTypeID, 'type');
                    dialogBox.appendChild(label);
                    label = document.createElement('p');
                    label.textContent = 'Date: ' + SurgeryTables[i].SurgeryDate;
                    dialogBox.appendChild(label);

                    // Create "remove", "reschedule", and "reassign" buttons
                    var removeButton = document.createElement('button');
                    removeButton.textContent = 'Remove';
                    removeButton.addEventListener('click', (function(SurgeryTypeID, SurgeonID, PatientID, SurgeryDate) {
                            return function() {
                                fetch('/edit-surgery', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/x-www-form-urlencoded',
                                    },
                                    body: new URLSearchParams({
                                        SurgeryTypeID: SurgeryTypeID,
                                        SurgeonID: SurgeonID,
                                        PatientID: PatientID,
                                        SurgeryDate: SurgeryDate,
                                        EditType: 'remove'
                                    })
                                })
                                    .then(response => response.text())
                                    .then(data => {
                                        alert(`Patient ${getName(PatientID, 'patient')}'s surgery on ${SurgeryDate} was removed!`);
                                        populateTable();
                                })
                            }
                        })(SurgeryTables[i].SurgeryTypeID, SurgeryTables[i].SurgeonID, SurgeryTables[i].PatientID, SurgeryTables[i].SurgeryDate));

                    var rescheduleButton = document.createElement('button');
                    rescheduleButton.textContent = 'Reschedule';
                    rescheduleButton.addEventListener('click', (function(SurgeryTypeID, SurgeonID, PatientID, SurgeryDate) {
                            return function() {
                                var year, month, day, time, enteredDate;
                                while(true) {
                                    while (true) {
                                        year = prompt("Please enter the year:");
                                        if (year === null) return;
                                        if (year < 0 || year > 9999 || isNaN(year)) {
                                            alert("Invalid year");
                                        } else break;
                                    }

                                    while (true) {
                                        month = prompt("Please enter the month:");
                                        if (month === null) return;
                                        if (month < 1 || month > 12 || isNaN(month)) {
                                            alert("Invalid month");
                                        } else break;
                                    }

                                    while (true) {
                                        day = prompt("Please enter the day:");
                                        if (day === null) return;
                                        if (day < 1 || day > 31 || isNaN(day)) {
                                            alert("Invalid day");
                                        } else break;
                                    }

                                    while (true) {
                                        time = prompt("Please enter the time in HH:MM format:");
                                        if (time === null) return;
                                        if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(time)) {
                                            alert("Invalid time");
                                        } else break;
                                    }

                                    enteredDate = new Date(year, month - 1, day, time.split(':')[0], time.split(':')[1]);
                                    var currentDate = new Date();

                                    if (enteredDate < currentDate) {
                                        alert("The entered date and time is in the past. Please enter a future date and time.");
                                    } else {
                                        break;
                                    }
                                }

                                fetch('/edit-surgery', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/x-www-form-urlencoded',
                                    },
                                    body: new URLSearchParams({
                                        SurgeryTypeID: SurgeryTypeID,
                                        SurgeonID: SurgeonID,
                                        PatientID: PatientID,
                                        SurgeryDate: formatDate(enteredDate),
                                        EditType: 'reschedule'
                                    })
                                })
                                    .then(response => response.text())
                                    .then(data => {
                                        alert(`Patient ${getName(PatientID, 'patient')}'s surgery was rescheduled to ${enteredDate}!`);
                                        populateTable();
                                })
                            }
                        })(SurgeryTables[i].SurgeryTypeID, SurgeryTables[i].SurgeonID, SurgeryTables[i].PatientID, SurgeryTables[i].SurgeryDate));
                    var reassignButton = document.createElement('button');
                    reassignButton.textContent = 'Reassign';
                    reassignButton.addEventListener('click', (function(SurgeryTables, SurgeryTypeID, SurgeonID, PatientID, SurgeryDate) {
                            return function() {
                                let dropdown = document.createElement('select');

                                // Create a Set to store unique SurgeonIDs
                                let uniqueSurgeonIDs = new Set();

                                // Add each SurgeonID to the Set
                                SurgeryTables.forEach(surgeon => uniqueSurgeonIDs.add(surgeon.SurgeonID));

                                // Convert the Set to an Array
                                let surgeonArray = Array.from(uniqueSurgeonIDs);

                                // Sort the Array alphabetically based on the surgeon's name
                                surgeonArray.sort((a, b) => {
                                    let nameA = getName(a, 'surgeon');
                                    let nameB = getName(b, 'surgeon');

                                    if (nameA < nameB) return -1;
                                    if (nameA > nameB) return 1;
                                    return 0;
                                });

                                // Create a dropdown list with the sorted SurgeonIDs
                                surgeonArray.forEach(surgeonID => {
                                    let option = document.createElement('option');
                                    option.value = surgeonID;
                                    option.text = getName(surgeonID, 'surgeon');
                                    dropdown.add(option);
                                });

                                // Create a dialog box
                                let dialogBox = document.createElement('dialog');
                                dialogBox.appendChild(dropdown);

                                // Add a button to submit the selected member
                                let submitButton = document.createElement('button');
                                submitButton.textContent = 'Submit';
                                submitButton.addEventListener('click', function() {
                                    let selectedMember = parseInt(dropdown.options[dropdown.selectedIndex].value);
                                    // Close the dialog box
                                    dialogBox.close();

                                    // Send the reassignment request
                                    fetch('/edit-surgery', {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/x-www-form-urlencoded',
                                        },
                                        body: new URLSearchParams({
                                            SurgeryTypeID: SurgeryTypeID,
                                            SurgeonID: SurgeonID,
                                            PatientID: PatientID,
                                            SurgeryDate: SurgeryDate,
                                            EditType: 'reassign',
                                            NewSurgeonID: selectedMember,
                                        })
                                    })
                                    .then(response => response.text())
                                    .then(data => {
                                        alert(`Patient ${getName(PatientID, 'patient')}'s surgery with ${getName(SurgeonID, 'surgeon')} was reassigned to ${getName(selectedMember, 'surgeon')}!`);
                                        populateTable();
                                    });
                                });
                                dialogBox.appendChild(submitButton);

                                // Create a close button
                                var closeButton = document.createElement('button');
                                closeButton.textContent = 'X';
                                closeButton.style.position = 'relative';
                                closeButton.style.top = '0';
                                closeButton.style.right = '0';
                                closeButton.addEventListener('click', function() {
                                    // Remove the dialogue box and the backdrop when the close button is clicked
                                    document.body.removeChild(dialogBox);
                                });
                                dialogBox.appendChild(closeButton)

                                // Show the dialog box
                                document.body.appendChild(dialogBox);
                                dialogBox.showModal();
                            }
                        })(SurgeryTables, SurgeryTables[i].SurgeryTypeID, SurgeryTables[i].SurgeonID, SurgeryTables[i].PatientID, SurgeryTables[i].SurgeryDate));

                    // Add the buttons to the dialogue box
                    dialogBox.appendChild(removeButton);
                    dialogBox.appendChild(rescheduleButton);
                    dialogBox.appendChild(reassignButton);

                    // Create a close button
                    var closeButton = document.createElement('button');
                    closeButton.textContent = 'X';
                    closeButton.style.position = 'absolute';
                    closeButton.style.top = '0';
                    closeButton.style.right = '0';
                    closeButton.addEventListener('click', function() {
                        // Remove the dialogue box and the backdrop when the close button is clicked
                        document.body.removeChild(dialogBox);
                        document.body.removeChild(backdrop);
                    });

                    // Add the close button to the dialogue box
                    dialogBox.appendChild(closeButton);

                    // Add the dialogue box and the backdrop to the body of the document
                    document.body.appendChild(backdrop);
                    document.body.appendChild(dialogBox);
                };
            })(i, SurgeryTables));
        }
    }
}

function formatDate(date) {
    var year = date.getFullYear();
    var month = ('0' + (date.getMonth() + 1)).slice(-2);
    var day = ('0' + date.getDate()).slice(-2);
    return year + '-' + month + '-' + day;
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

            // Sort the data
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