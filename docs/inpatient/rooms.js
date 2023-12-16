window.onload = async function() {
    var databaseItems = document.getElementById('databaseItems');
    var bedAssign = document.getElementById('bed-assign');
    var wings = document.getElementById('wings');
    var nursingUnitStartLabel = document.querySelector('label[for="nursingUnitStart"]');
    var nursingUnitStart = document.getElementById('nursingUnitStart');
    var rangeCheckbox = document.getElementById('rangeCheckbox');
    var nursingUnitEnd = document.getElementById('nursingUnitEnd');
    var resetFiltersButton = document.getElementById('reset');

    let responseBeds = await fetch('/get-beds');
    let beds = await responseBeds.json();

    // Fetch all patients and store them in a map for quick lookup
    let responsePatients = await fetch('/get-patients');
    var patients = await responsePatients.json();
    let patientMap = {};
    for (let patient of patients) {
        patientMap[patient.BedID] = patient;
    }

    // Function to populate the table with data
    function populateTable(data) {
        // Clear the table first
        databaseItems.querySelector('tbody').innerHTML = '';

        var count = 0;

        for (var i = 0; i < data.length; i++) {
            var patient = patientMap[data[i].ID];

            // Filter the data based on the selected option
            if (bedAssign.value === 'assigned' && !patient) continue;
            if (bedAssign.value === 'unassigned' && patient) continue;

            // Filter the data based on the selected wing
            if (wings.value !== 'all' && data[i].Wing !== wings.value) continue;

            // Filter the data based on the selected nursing unit
            var nursingUnit = parseInt(data[i].NursingUnit);
            var start = parseInt(nursingUnitStart.value);
            var end = rangeCheckbox.checked ? parseInt(nursingUnitEnd.value) : start;
            if (start != 0 && (nursingUnit < start || nursingUnit > end)) continue;

            var row = document.createElement('tr');

            // Style the row based on whether its index is even or odd
            if (count  % 2 === 0) {
                row.style.backgroundColor = '#D3D3D3';
            } else {
                row.style.backgroundColor = '#808080';
            }

            count++;

            var idCell = document.createElement('td');
            idCell.textContent = data[i].ID;
            row.appendChild(idCell);

            var nursingUnitCell = document.createElement('td');
            nursingUnitCell.textContent = data[i].NursingUnit;
            row.appendChild(nursingUnitCell);

            var wingCell = document.createElement('td');
            wingCell.textContent = data[i].Wing;
            row.appendChild(wingCell);

            var roomNumberCell = document.createElement('td');
            roomNumberCell.textContent = data[i].RoomNumber;
            row.appendChild(roomNumberCell);

            var bedLetterCell = document.createElement('td');
            bedLetterCell.textContent = data[i].BedLetter;
            row.appendChild(bedLetterCell);

            var patient = patientMap[data[i].ID];
            var patientCell = document.createElement('td');
            patientCell.textContent = patient ? patient.Name : 'No patient assigned';
            row.appendChild(patientCell);

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
            ellipsisButton.addEventListener('click',  (function(patient, bedNumber) {
                return function() {
                    // Create the modal backdrop
                    var modalBackdrop = document.createElement('div');
                    modalBackdrop.style.position = 'fixed';
                    modalBackdrop.style.top = '0';
                    modalBackdrop.style.left = '0';
                    modalBackdrop.style.width = '100%';
                    modalBackdrop.style.height = '100%';
                    modalBackdrop.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
                    document.body.appendChild(modalBackdrop);

                    // Create the dialog box
                    var dialogBox = document.createElement('div');
                    dialogBox.style.display = 'block';
                    dialogBox.style.width = '20vw';
                    dialogBox.style.backgroundColor = '#fff';
                    dialogBox.style.position = 'fixed';
                    dialogBox.style.top = '15%';
                    dialogBox.style.left = '50%';
                    dialogBox.style.transform = 'translate(-50%, -50%)';
                    dialogBox.style.padding = '2vh';
                    dialogBox.style.boxShadow = '0px 0px 10px rgba(0, 0, 0, 0.1)';
                    dialogBox.style.borderRadius = '10px';
                    modalBackdrop.appendChild(dialogBox);

                    // Write the patients name
                    // Create the patient name display
                    var patientNameDisplay = document.createElement('p');
                    patientNameDisplay.textContent = patient ? patient.Name : 'No patient assigned';
                    dialogBox.appendChild(patientNameDisplay);

                    // Create the close button
                    var closeButton = document.createElement('button');
                    closeButton.textContent = 'X';
                    closeButton.style.position = 'absolute';
                    closeButton.style.right = '10px';
                    closeButton.style.top = '10px';
                    closeButton.style.backgroundColor = 'transparent';
                    closeButton.style.border = 'none';
                    closeButton.style.fontSize = '20px';
                    closeButton.style.cursor = 'pointer';
                    closeButton.addEventListener('click', function() {
                        document.body.removeChild(modalBackdrop);
                    });
                    dialogBox.appendChild(closeButton);

                    // Create the options
                    var createOptionButton = function(text) {
                        var optionButton = document.createElement('button');
                        optionButton.textContent = text;
                        optionButton.style.display = 'block';
                        optionButton.style.width = '100%';
                        optionButton.style.padding = '10px';
                        optionButton.style.marginTop = '10px';
                        optionButton.style.backgroundColor = '#007BFF';
                        optionButton.style.color = 'white';
                        optionButton.style.border = 'none';
                        optionButton.style.borderRadius = '5px';
                        optionButton.style.cursor = 'pointer';
                        optionButton.addEventListener('click', function() {
                            // Code to handle the option goes here
                        });
                        return optionButton;
                    };

                    var viewOrNewOption = createOptionButton(patient ? 'View Patient' : 'Add New Patient');
                    var changeOrExistingOption = createOptionButton(patient ? 'Change Patient' : 'Add Existing Patient');
                    var removeOption = createOptionButton('Remove Patient');

                    // Add the options to the dialog box
                    if (patient) {
                        dialogBox.appendChild(viewOrNewOption);
                        viewOrNewOption.addEventListener('click', (function(patient) {
                            return function() {
                                window.location.href = '/patient?patient=' + patient.ID;
                            }
                        })(patient));
                        dialogBox.appendChild(changeOrExistingOption);
                        dialogBox.appendChild(removeOption);
                        removeOption.addEventListener('click', (function(patient, bedNumber) {
                            return function() {
                                fetch('/set-patient-info', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/x-www-form-urlencoded',
                                    },
                                    body: new URLSearchParams({
                                        patientID: patient.ID,
                                        param: 'BedID',
                                        value: 'NULL'
                                    })
                                })
                                    .then(response => response.text())
                                    .then(data => {
                                    // Add follow-up message here
                                        console.log('Success:', data);
                                        alert(`Patient ${patient.Name} was successfully removed from bed #${bedNumber}`);
                                        patientMap[bedNumber] = null;
                                        populateTable(beds);
                                        var clickEvent = new Event('click');
                                        closeButton.dispatchEvent(clickEvent);
                                })
                            }
                        })(patient, bedNumber));
                    }
                    else
                    {
                        dialogBox.appendChild(viewOrNewOption);
                        viewOrNewOption.addEventListener('click', (function(bedNumber) {
                            return function() {
                                window.location.href = '/patient?bed=' + bedNumber;
                            }
                        })(bedNumber));

                        dialogBox.appendChild(changeOrExistingOption);
                    }

                    changeOrExistingOption.addEventListener('click', (function(patient, bedNumber) {
                        return function() {
                            let newSelectPatientDrop = document.createElement('select');

                            for (var i = 0; i < patients.length; i++) {
                                let option = document.createElement('option');
                                option.value = patients[i].ID;
                                option.text = patients[i].Name;
                                newSelectPatientDrop.appendChild(option);
                            }

                            // Remove the old dropdown if it exists
                            let oldDropdown = dialogBox.querySelector('select');
                            if (oldDropdown) {
                                dialogBox.removeChild(oldDropdown);
                            }

                            // Append the new dropdown
                            dialogBox.appendChild(newSelectPatientDrop);

                            let newAddButton = document.createElement('button');
                            newAddButton.textContent = 'Add';
                            newAddButton.addEventListener('click', function() {
                                // Remove the current patient if there is one
                                if(patient) {
                                    fetch('/set-patient-info', {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/x-www-form-urlencoded',
                                        },
                                        body: new URLSearchParams({
                                            patientID: patient.ID,
                                            param: 'BedID',
                                            value: 'NULL'
                                        })
                                    })
                                        .then(response => response.text())
                                        .then(data => {
                                        // Add follow-up message here
                                            console.log('Success:', data);
                                            alert(`Patient ${patient.Name} was successfully removed from bed #${bedNumber}`);
                                            patientMap[bedNumber] = null;

                                            // Add this patient
                                            fetch('/set-patient-info', {
                                                method: 'POST',
                                                headers: {
                                                    'Content-Type': 'application/x-www-form-urlencoded',
                                                },
                                                body: new URLSearchParams({
                                                    patientID: newSelectPatientDrop.value,
                                                    param: 'BedID',
                                                    value: bedNumber
                                                })
                                            })
                                                .then(response => response.text())
                                                .then(data => {
                                                // Add follow-up message here
                                                    console.log('Success:', data);
                                                    alert(`Patient with ID ${newSelectPatientDrop.value} was successfully assigned to bed #${bedNumber}`);
                                                    let newAddedPatient;
                                                    patientMap[bedNumber] = patients[newSelectPatientDrop.value - 1];
                                                    populateTable(beds);
                                                    var clickEvent = new Event('click');
                                                    closeButton.dispatchEvent(clickEvent);
                                            })
                                    })
                                } else
                                {
                                    // Only add this patient
                                    // Add this patient
                                    fetch('/set-patient-info', {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/x-www-form-urlencoded',
                                        },
                                        body: new URLSearchParams({
                                            patientID: newSelectPatientDrop.value,
                                            param: 'BedID',
                                            value: bedNumber
                                        })
                                    })
                                        .then(response => response.text())
                                        .then(data => {
                                        // Add follow-up message here
                                            console.log('Success:', data);
                                            alert(`Patient with ID ${newSelectPatientDrop.value} was successfully assigned to bed #${bedNumber}`);
                                            patientMap[bedNumber] = patients[newSelectPatientDrop.value - 1];
                                            populateTable(beds);
                                            var clickEvent = new Event('click');
                                            closeButton.dispatchEvent(clickEvent);
                                    })
                                }

                            });

                            dialogBox.appendChild(newAddButton);
                        }
                    })(patient, bedNumber));

                }
            })(patient, data[i].ID));
            ellipsisCell.appendChild(ellipsisButton);
            row.appendChild(ellipsisCell);


            databaseItems.querySelector('tbody').appendChild(row);
        }
    }

    // Initial population of the table
    populateTable(beds);

    // Update the table whenever the selected option changes
    bedAssign.addEventListener('change', function() {
        populateTable(beds);
    });

    // Update the table whenever the selected wing changes
    wings.addEventListener('change', function() {
        populateTable(beds);
    });

    // Enable or disable the second dropdown based on the checkbox
    rangeCheckbox.addEventListener('change', function() {
        nursingUnitEnd.disabled = !this.checked;
        nursingUnitStartLabel.textContent = this.checked ? 'Nursing Unit Start:' : 'Nursing Unit:';
        if (this.checked) {
            // Remove the "All Units" option from the start dropdown
            nursingUnitStart.options[0].disabled = true;
            // Remove the null option from the end dropdown
            nursingUnitEnd.options[0].disabled = true;
            // If "All Units" was selected, change the selection to "1"
            if (nursingUnitStart.value === '0') {
                nursingUnitStart.value = '1';
            }
            // If null was selected or value is less than nursing unit, change the end selection to match start
            if (nursingUnitEnd.value === '0' || nursingUnitEnd.value < nursingUnitStart.value) {
                nursingUnitEnd.value = nursingUnitStart.value;
            }
        } else {
            // Add the "All Units" option back to the start dropdown
            nursingUnitStart.options[0].disabled = false;
        }
        populateTable(beds);
    });

    // Update the table whenever the selected nursing unit changes
    nursingUnitStart.addEventListener('change', function() {
        if (rangeCheckbox.checked && parseInt(nursingUnitStart.value) > parseInt(nursingUnitEnd.value)) {
            // If the start value is greater than the end value, change the end value to match the start value
            nursingUnitEnd.value = nursingUnitStart.value;
        }
        populateTable(beds);
    });

    // Update the table whenever the selected nursing unit range changes
    nursingUnitEnd.addEventListener('change', function() {
        if (rangeCheckbox.checked && parseInt(nursingUnitEnd.value) < parseInt(nursingUnitStart.value)) {
            // If the end value is less than the start value, change the start value to match the end value
            nursingUnitStart.value = nursingUnitEnd.value;
        }
        populateTable(beds);
    });

    // Reset filters
    resetFiltersButton.addEventListener('click', function() {
        document.getElementById('wings').value = 'all';
        document.getElementById('nursingUnitStart').value = '0';
        document.getElementById('nursingUnitEnd').value = '0';
        document.getElementById('rangeCheckbox').checked = false;
        document.getElementById('bed-assign').value = 'all';
        nursingUnitEnd.disabled = true;
        nursingUnitStartLabel.textContent = 'Nursing Unit:';
        populateTable(beds);
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
            beds.sort(function(a, b) {
                // If sorting by 'AssignedPatient', use the patient data
                if (sortField === 'AssignedPatient') {
                    var patientA = patientMap[a.ID] ? patientMap[a.ID].Name : '';
                    var patientB = patientMap[b.ID] ? patientMap[b.ID].Name : '';
                    var comparison = btn.ascending ? patientA.localeCompare(patientB) : patientB.localeCompare(patientA);
                    if (comparison !== 0) return comparison;
                } else {
                    // Otherwise, use the bed data
                    if (a[sortField] !== b[sortField]) {
                        return btn.ascending ? (a[sortField] < b[sortField] ? -1 : 1) : (a[sortField] > b[sortField] ? -1 : 1);
                    }
                }

                // If the fields match, sub-sort by 'ID'
                return a.ID - b.ID;
            });

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
            populateTable(beds);
        });
    });


};