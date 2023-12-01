window.onload = async function() {
    let responsePatients = await fetch('/get-patients');
    let patients = await responsePatients.json();
    let selectedPatientID = patients[0].ID;

    let responseNurseRelationships = await fetch('/get-patient-nurse-relationship', {
        method: 'POST',
    });
    let nurseRelationships = await responseNurseRelationships.json();

    let responsePhysicianRelationships = await fetch('/get-patient-physician-relationship', {
        method: 'POST',
        body: `patientID=${selectedPatientID}`
    });
    let physicianRelationships = await responsePhysicianRelationships.json();


    // Create a mapping of database field names to display names
    let fieldNames = {
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

    // Specify the order of the fields
    let fieldOrder = ['Name', 'Gender', 'DOB', 'Address', 'PhoneNumber', 'SocialSecurityNumber', 'BedID', 'AdmissionDate', 'AdmissionDuration', 'PrimaryPhysicianID'];



    let select = document.createElement('select');
    select.onchange = function() {
        let relationshipLinks = document.getElementById('relationships');
        // Clear the div before adding the new table
        while (relationshipLinks.firstChild) {
            relationshipLinks.removeChild(relationshipLinks.firstChild);
        }

        selectedPatientID = this.value;
        createPatientTable(patients, selectedPatientID,  'patient');
        createRelationshipLink('View Patient Information', patients, selectedPatientID, createPatientTable, 'patient');
        createRelationshipLink('View Assigned Physicians', physicianRelationships, selectedPatientID, createPatientTable, 'physician');
        createRelationshipLink('View Assigned Nurses', nurseRelationships, selectedPatientID, createPatientTable, 'nurse');
    }

    for(let patient of patients) {
        let option = document.createElement('option');
        option.value = patient.ID;
        option.text = patient.Name;

        select.appendChild(option);
    }

    createPatientTable(patients, selectedPatientID,  'patient');
    createRelationshipLink('View Patient Information', patients, selectedPatientID, createPatientTable, 'patient');
    createRelationshipLink('View Assigned Physicians', physicianRelationships, selectedPatientID, createPatientTable, 'physician');
    createRelationshipLink('View Assigned Nurses', nurseRelationships, selectedPatientID, createPatientTable, 'nurse');

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
        let tableWrapper = document.createElement('div');
        tableWrapper.style.display = 'flex';
        tableWrapper.style.justifyContent = 'center';
        tableWrapper.appendChild(table);
        patientTableDiv.appendChild(tableWrapper);
        return;
    }

    for (let patient of matchedPatients) {
        let table = document.createElement('table');
        for (let key of fieldValues.fieldOrder) {
            if (key in patient) {
                let row = document.createElement('tr');

                let cellKey = document.createElement('td');
                cellKey.textContent = fieldValues.fieldNames[key] || key;  // Use the display name if it exists, otherwise use the database field name
                row.appendChild(cellKey);

                let cellValue = document.createElement('td');
                cellValue.textContent = patient[key] || '';  // Use an empty string if the key is not in the data
                row.appendChild(cellValue);

                table.appendChild(row);
            }
        }
        let tableWrapper = document.createElement('div');
        tableWrapper.style.display = 'flex';
        tableWrapper.style.justifyContent = 'center';
        tableWrapper.appendChild(table);
        patientTableDiv.appendChild(tableWrapper);
    }
}



function createRelationshipLink(text, data, key, callback, fieldValuesTitle) {
    let a = document.createElement('a');
    a.textContent = text;
    a.href = '#';
    a.onclick = function() {
        callback(data, key, fieldValuesTitle);
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
    } else if (field === 'physician')
    {

    } else if (field === 'nurse')
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