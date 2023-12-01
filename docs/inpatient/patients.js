let physicianRelationships;
let nurseRelationships;
let patients;

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

    document.getElementById('patientSelect').appendChild(select);
}

function createPatientTable(patients, patientID, fieldValuesTitle) {
    let fieldValues = getFieldValues(fieldValuesTitle)
    let matchedPatients = patients.filter(patient => patient.ID == patientID || patient.PatientID == patientID);
    console.log(patients);
    console.log(patientID);
    console.log(fieldValuesTitle);
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