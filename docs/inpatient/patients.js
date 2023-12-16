let physicianRelationships;
let nurseRelationships;
let patients;
let employees;

window.onload = async function() {
    let responsePatients = await fetch('/get-patients');
    patients = await responsePatients.json();
    let selectedPatientID = patients[0].ID;

    let responseNurseRelationships = await fetch('/get-patient-nurse-relationship', {
        method: 'POST',
    });
    nurseRelationships = await responseNurseRelationships.json();

    let responsePhysicianRelationships = await fetch('/get-patient-physician-relationship', {
        method: 'POST',
    });
    physicianRelationships = await responsePhysicianRelationships.json();

    let responseEmployees = await fetch('/get-employees')
    employees = await responseEmployees.json();

    let select = document.createElement('select');
    select.onchange = function() {
        let relationshipLinks = document.getElementById('relationships');
        // Clear the div before adding the new table
        while (relationshipLinks.firstChild) {
            relationshipLinks.removeChild(relationshipLinks.firstChild);
        }

        selectedPatientID = this.value;
        createPatientTable(patients, selectedPatientID,  'patient');
        createRelationshipLink('View Patient Information', selectedPatientID, createPatientTable, 'patient');
        createRelationshipLink('View Assigned Physicians', selectedPatientID, createPatientTable, 'physician');
        createRelationshipLink('View Assigned Nurses', selectedPatientID, createPatientTable, 'nurse');
        // Get the parent element
        let parentElement = document.getElementById('userInputRow');

        // Remove the "Assign Physician" button if it exists
        let assignPhysicianButton = parentElement.querySelector('.button');
        if (assignPhysicianButton) {
            parentElement.removeChild(assignPhysicianButton);
        }

        // Remove the "Assign Nurse" button if it exists
        let assignNurseButton = parentElement.querySelector('.button');
        if (assignNurseButton) {
            parentElement.removeChild(assignNurseButton);
        }
        createAssignButton('Assign Physician', selectedPatientID, createPatientTable, 'physician');
        createAssignButton('Assign Nurse', selectedPatientID, createPatientTable, 'nurse');
    }

    for(let patient of patients) {
        let option = document.createElement('option');
        option.value = patient.ID;
        option.text = patient.Name;

        select.appendChild(option);
    }

    createPatientTable(patients, selectedPatientID,  'patient');
    createRelationshipLink('View Patient Information', selectedPatientID, createPatientTable, 'patient');
    createRelationshipLink('View Assigned Physicians', selectedPatientID, createPatientTable, 'physician');
    createRelationshipLink('View Assigned Nurses', selectedPatientID, createPatientTable, 'nurse');
    // Get the parent element
    let parentElement = document.getElementById('userInputRow');

    // Remove the "Assign Physician" button if it exists
    let assignPhysicianButton = parentElement.querySelector('.button');
    if (assignPhysicianButton) {
        parentElement.removeChild(assignPhysicianButton);
    }

    // Remove the "Assign Nurse" button if it exists
    let assignNurseButton = parentElement.querySelector('.button');
    if (assignNurseButton) {
        parentElement.removeChild(assignNurseButton);
    }
    createAssignButton('Assign Physician', selectedPatientID, createPatientTable, 'physician');
    createAssignButton('Assign Nurse', selectedPatientID, createPatientTable, 'nurse');


    document.getElementById('patientSelect').appendChild(select);
}

function createPatientTable(patients, patientID, fieldValuesTitle) {
    let fieldValues = getFieldValues(fieldValuesTitle)
    let matchedPatients = patients.filter(patient => patient.ID == patientID || patient.PatientID == patientID);
    let patientTableDiv = document.getElementById('patientTable');
    // Clear the div before adding the new table
    while (patientTableDiv.firstChild) {
        patientTableDiv.removeChild(patientTableDiv.firstChild);
    }

    if (matchedPatients.length === 0) {
        let table = document.createElement('table');
        let row = document.createElement('tr');
        let cell = document.createElement('td');
        cell.textContent = `None assigned at this time`;
        row.appendChild(cell);
        table.appendChild(row);
        patientTableDiv.appendChild(table);
        return;
    }

    for (let patient of matchedPatients) {
        let table = document.createElement('table');
        let tbody = document.createElement('tbody');  // Create a new tbody element for each patient

        for (let key of fieldValues.fieldOrder) {
            if (key in patient) {
                let row = document.createElement('tr');

                let cellKey = document.createElement('td');
                cellKey.textContent = fieldValues.fieldNames[key] || key;  // Use the display name if it exists, otherwise use the database field name
                row.appendChild(cellKey);

                let cellValue = document.createElement('td');
                cellValue.textContent = patient[key] || '';  // Use an empty string if the key is not in the data
                row.appendChild(cellValue);

                // Add a data-id attribute to the tbody
                if (key === 'NurseID' || key === 'PhysicianID') {
                    tbody.dataset.id = patient[key];
                }

                // Create the "Remove" button
                if (key === 'NurseID' || key === 'PhysicianID') {
                    let cellButton = document.createElement('td');
                    let button = document.createElement('button');
                    button.textContent = 'Remove';
                    button.onclick = (function(tbody, patient, key) {
                        return async function() {
                            // Get the ID of the clicked row
                            let id = patient[key];

                            // Select all tbodies with the same data-id
                            let tbodiesToRemove = document.querySelectorAll(`tbody[data-id="${id}"]`);

                            for (let tbodyToRemove of tbodiesToRemove) {
                                let response = await fetch('/remove-patient-relationship', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/x-www-form-urlencoded',
                                    },
                                    body: new URLSearchParams({
                                        patientID: patient.PatientID,
                                        otherID: patient[key],
                                        param: key,
                                    })
                                })

                                // Remove the tbody from the table
                                tbodyToRemove.parentNode.removeChild(tbodyToRemove);
                            }
                        }
                    })(tbody, patient, key);
                    cellButton.appendChild(button);
                    row.appendChild(cellButton);
                }

                tbody.appendChild(row);  // Append the row to the tbody instead of the table
            }
        }

        table.appendChild(tbody);  // Append the tbody to the table
        patientTableDiv.appendChild(table);
    }
}



function createRelationshipLink(text, patientID, callback, fieldValuesTitle) {
    let a = document.createElement('a');
    a.textContent = text;
    a.href = '#';
    a.onclick = async function() {
        // Re-fetch the data from the database
        let responsePatients = await fetch('/get-patients');
        let patients = await responsePatients.json();

        let responseNurseRelationships = await fetch('/get-patient-nurse-relationship', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                patientID: patientID,
            })
        });
        let nurseRelationships = await responseNurseRelationships.json();

        let responsePhysicianRelationships = await fetch('/get-patient-physician-relationship', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                patientID: patientID,
            })
        });
        let physicianRelationships = await responsePhysicianRelationships.json();

        // Call the callback function with the updated data
        if (fieldValuesTitle === 'patient') {
            callback(patients, patientID, fieldValuesTitle);
        } else if (fieldValuesTitle === 'physician') {
            callback(physicianRelationships, patientID, fieldValuesTitle);
        } else if (fieldValuesTitle === 'nurse') {
            callback(nurseRelationships, patientID, fieldValuesTitle);
        }
    }
    document.getElementById('relationships').appendChild(a);
}


function getFieldValues(field) {
    let fieldNames = {};
    let fieldOrder = [];

    if (field === 'patient') {
        fieldNames = {
            'ID': 'ID',
            'Name': 'Name',
            'Gender': 'Gender',
            'DOB': 'Date of Birth',
            'Address': 'Address',
            'PhoneNumber': 'Phone Number',
            'SocialSecurityNumber': 'Social Security Number',
            'BedID': 'Assigned Bed',
            'AdmissionDate': 'Admission Date',
            'AdmissionDuration': 'Admission Duration',
            'PrimaryPhysicianID': 'Primary Physician'
        };

        fieldOrder = ['Name', 'Gender', 'DOB', 'Address', 'PhoneNumber', 'SocialSecurityNumber', 'BedID', 'AdmissionDate', 'AdmissionDuration', 'PrimaryPhysicianID'];
    } else if (field === 'physician' || field === 'PhysicianID')
    {
        fieldNames = {
            'PhysicianID' : 'Physician',
            'PatientID' : 'PatientID',
        }

        fieldOrder = ['PhysicianID']
    } else if (field === 'nurse' || field === 'NurseID')
    {
        fieldNames = {
            'NurseID' : 'Nurse',
            'PatientID' : 'PatientID',
            'Shift' : 'Shift',
            'DateOfCare' : 'Date of Care'
        }

        fieldOrder = ['NurseID', 'Shift', 'DateOfCare']
    }

    return {fieldNames, fieldOrder};
}

function createAssignButton(text, patientID, callback, fieldValuesTitle) {
    let button = document.createElement('button');
    button.textContent = `Assign ${fieldValuesTitle}`;
    button.className = 'button';
    button.onclick = async function() {
        // Fetch the available physicians or nurses from the database
        let response = await fetch(`/get-${fieldValuesTitle}`, {
            method: 'GET',
        });

        let available = await response.json();

        // Create a modal dialog box
        let modal = document.createElement('div');
        modal.className = 'modal';

        // Create a container for the dropdown and button
        let container = document.createElement('div');
        container.className = 'dropdown-button-container';
        modal.appendChild(container);

        // Create a dropdown list of available physicians or nurses
        let select = document.createElement('select');
        let shiftDropdown;
        let dateTextbox;

        for (let item of available) {
            for(let employee of employees) {
                if (employee.ID === item.ID) {
                    let option = document.createElement('option');
                    option.value = item.ID;
                    option.text = employee.Name;
                    select.appendChild(option);
                    break;
                }
            }


        }
        container.appendChild(select);

        if (fieldValuesTitle === 'nurse') {
                // Create a dropdown for the shift
                shiftDropdown = document.createElement('select');
                let shifts = [1, 2, 3];
                for (let shift of shifts) {
                    let option = document.createElement('option');
                    option.value = shift;
                    option.text = 'Shift ' + shift;
                    shiftDropdown.appendChild(option);
                }
                container.appendChild(shiftDropdown);

                // Create a textbox for the date of care
                dateTextbox = document.createElement('input');
                dateTextbox.type = 'date';
                container.appendChild(dateTextbox);
        }

        // Create the "Assign" button
        let assignButton = document.createElement('button');
        assignButton.textContent = 'Assign';
        assignButton.className = 'button';
        assignButton.onclick = async function() {
            // Get the ID of the selected employee
            let selectedID = select.value;

            // Fetch the current assignments for the patient
            let responseAssignments;
            if (fieldValuesTitle === 'nurse') {
                responseAssignments = await fetch('/get-patient-nurse-relationship', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        patientID: patientID,
                        nurseID: selectedID,
                    })
                });
            } else if (fieldValuesTitle === 'physician') {
                responseAssignments = await fetch('/get-patient-physician-relationship', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        patientID: patientID,
                        physicianID: selectedID,
                    })
                });
            }

            let assignments = await responseAssignments.json();

            // Check if the selected employee is already assigned
            if (assignments.length > 0) {
                alert('This employee is already assigned to the patient.');
                return;
            }

            if (fieldValuesTitle === 'nurse') {
                // Create a new nurse-patient relationship
                let response = await fetch(`/assign-${fieldValuesTitle}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        patientID: patientID,
                        nurseID: select.value,
                        shift: shiftDropdown.value,
                        dateOfCare: dateTextbox.value
                    })
                });
            } else
            {
                // Create a new physician-patient
                let response = await fetch(`/assign-${fieldValuesTitle}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        patientID: patientID,
                        physicianID: select.value,
                    })
                });
            }


            // Close the modal dialog box
            modal.style.display = 'none';
        }
        container.appendChild(assignButton);

        // Create the "Cancel" button
        let cancelButton = document.createElement('button');
        cancelButton.textContent = 'Cancel';
        cancelButton.className = 'button';
        cancelButton.onclick = function() {
            // Close the modal dialog box
            modal.style.display = 'none';
        }
        container.appendChild(cancelButton);

        // Append the modal dialog box to the page
        document.body.appendChild(modal);
    }
    document.getElementById('userInputRow').appendChild(button);
}
