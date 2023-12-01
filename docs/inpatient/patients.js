window.onload = async function() {
    let responsePatients = await fetch('/get-patients');
    let patients = await responsePatients.json();

    let select = document.createElement('select');
    select.onchange = function() {
        createPatientTable(this.value, patients);
    }

    for(let patient of patients) {
        let option = document.createElement('option');
        option.value = patient.ID;
        option.text = patient.Name;

        select.appendChild(option);
    }

    createPatientTable(patients[0].ID, patients);

    document.getElementById('patientSelect').appendChild(select);
}

function createPatientTable(patientID, patients) {
    let patient = patients.find(patient => patient.ID == patientID);

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

    let table = document.createElement('table');
    for (let key of fieldOrder) {
        if (key in patient) {
            let row = document.createElement('tr');

            let cellKey = document.createElement('td');
            cellKey.textContent = fieldNames[key] || key;  // Use the display name if it exists, otherwise use the database field name
            row.appendChild(cellKey);

            let cellValue = document.createElement('td');
            cellValue.textContent = patient[key];
            row.appendChild(cellValue);

            table.appendChild(row);
        }
    }

    let patientTableDiv = document.getElementById('patientTable');

     // Clear the div before adding the new table
    while (patientTableDiv.firstChild) {
        patientTableDiv.removeChild(patientTableDiv.firstChild);
    }

    patientTableDiv.appendChild(table);
}