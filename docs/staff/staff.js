var employees;
var patientAssignedNurses;

window.onload = async function() {
    // Initialize DB variables
    let response = await fetch('/get-employees');
    employees = await response.json();

    response = await fetch('/get-patient-nurse-relationship', {
        method: 'POST',
    });
    patientAssignedNurses = await response.json();

    // Populate Table
    PopulateTable();

    // Get the dropdown element
    let dropdown = document.getElementById('rolefilter');

    // Create a set to store unique roles
    let roles = new Set();

    // Loop through the employees
    for (let i = 0; i < employees.length; i++) {
        // Add the role to the set
        roles.add(employees[i]['Role']);
    }

    // Loop through the unique roles
    for (let role of roles) {
        // Create a new option element
        let option = document.createElement('option');
        if (role === null) {
            option.value = 'No Assigned Role';
            option.text = 'No Assigned Role';
        } else {
            option.value = role;
            option.text = role;
        }

        // Add the option to the dropdown
        dropdown.add(option);
    }

    // Role Filter event listener
    var roleFilter = document.getElementById('rolefilter');
    roleFilter.addEventListener('change', function() {
        PopulateTable();
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
            employees.sort(function(a, b) {
                if (a[sortField] !== b[sortField]) {
                    return btn.ascending ? (a[sortField] < b[sortField] ? -1 : 1) : (a[sortField] > b[sortField] ? -1 : 1);
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
            PopulateTable();
        });
    });
}

PopulateTable = async function() {
    // Clear the table first
    databaseItems.querySelector('tbody').innerHTML = '';

    // For each employee
    for (let i = 0; i < employees.length; i++) {
        let employee = employees[i];
        if (!employee.Role) {
            employee.Role = 'No Assigned Role';
        }

        // Filter the data based on the selected role
        var roleFilter = document.getElementById('rolefilter');
        if (roleFilter.value != employee.Role && roleFilter.value != 'all') {
            continue;
        }

        if (roleFilter.value === 'null' && employee.Role) {
            console.log('whoa1');
            continue;
        }

        var row = document.createElement('tr');

        // Style the row based on whether its index is even or odd
        if (i  % 2 === 0) {
            row.style.backgroundColor = '#D3D3D3';
        } else {
            row.style.backgroundColor = '#808080';
        }

        var idCell = document.createElement('td');
        idCell.textContent = employee.ID;
        row.appendChild(idCell);

        var nameCell = document.createElement('td');
        nameCell.textContent = employee.Name;
        row.appendChild(nameCell);

        var roleCell = document.createElement('td');
        roleCell.textContent = employee.Role;
        row.appendChild(roleCell);

        var phoneNumberCell = document.createElement('td');
        phoneNumberCell.textContent = employee.TelephoneNumber;
        row.appendChild(phoneNumberCell);

        var shiftCell = document.createElement('td');
        if (employee.Shift == null) {
            if (employee.Role == 'Nurse') {
                shiftCell.textContent = '1';
            } else
            {
                shiftCell.textContent = 'No Assigned Shift';
            }
        } else {
            shiftCell.textContent = employee.Shift;
        }
        row.appendChild(shiftCell);

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
        ellipsisButton.addEventListener('click', function() {

        });

        ellipsisCell.appendChild(ellipsisButton);
        row.appendChild(ellipsisCell);


        databaseItems.querySelector('tbody').appendChild(row);
    }



    /*
    for (var i = 0; i < data.length; i++) {
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
                            window.location.href = '/patient/PatientManagement?option=addnew&bedNumber=' + bedNumber;
                        }
                    })(bedNumber));

                    dialogBox.appendChild(changeOrExistingOption);
                    changeOrExistingOption.addEventListener('click', (function(bedNumber) {
                        return function() {
                            window.location.href = '/patient/PatientManagement?option=addexisting&bedNumber=' + bedNumber;
                        }
                    })(bedNumber));
                }

            }
        })(patient, data[i].ID));
        ellipsisCell.appendChild(ellipsisButton);
        row.appendChild(ellipsisCell);


        databaseItems.querySelector('tbody').appendChild(row);

    }

     */
    }