let physicians;
let diagnoses;
let consultations;
let employees;
let patients;

window.onload = async function() {
    let response = await fetch('/get-patients');
    patients = await response.json();
    let selectedPatientID = patients[0].ID;

    response = await fetch('/get-patient-diagnosis', {
        method: 'POST',
    });
    diagnoses = await response.json();

    response = await fetch('/get-physician');
    physicians = await response.json();

    response = await fetch('/get-employees');
    employees = await response.json();

    response = await fetch('/get-consultation');
    consultations = await response.json();

    let select = document.createElement('select');
    select.id = 'selectPatient';
    select.onchange = function() {
        let relationshipLinks = document.getElementById('relationships');
        // Clear the div before adding the new table
        while (relationshipLinks.firstChild) {
            relationshipLinks.removeChild(relationshipLinks.firstChild);
        }

        selectedPatientID = this.value;
        createPatientTable(patients, selectedPatientID,  'patient');

        // Get the parent element
        let parentElement = document.getElementById('userInputRow');
    }

    for(let patient of patients) {
        let option = document.createElement('option');
        option.value = patient.ID;
        option.text = patient.Name;

        select.appendChild(option);
    }

    createPatientTable(patients, selectedPatientID,  'patient');

    // Get the parent element
    let parentElement = document.getElementById('userInputRow');

    // Add Diagnoses Table link
    let diagnosesTableLink = document.createElement('a');
    diagnosesTableLink.textContent = 'Show Diagnoses';
    diagnosesTableLink.href = '#';
    diagnosesTableLink.onclick = function() {
        createPatientTable(diagnoses, selectedPatientID, 'diagnoses');
        return false;  // Prevent default action
    };

    // Add Consultations Table link
    let consultationsTableLink = document.createElement('a');
    consultationsTableLink.textContent = 'Show Appointments';
    consultationsTableLink.href = '#';
    consultationsTableLink.onclick = function() {
        createPatientTable(consultations, selectedPatientID, 'consultations');
        return false;  // Prevent default action
    };

    parentElement.appendChild(diagnosesTableLink);
    parentElement.appendChild(consultationsTableLink);

    document.getElementById('patientSelect').appendChild(select);
}

getName = function(ID, Table) {
    var name;
    if (Table === 'patient') {
        name = Patients.find(p => p.ID === ID).Name;
    }
    else if (Table === 'employee') {
        name = employees.find(p => p.ID === ID).Name;
    }
    else {
        console.log('Error: Table not found');
    }

    return name;
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
        cell.textContent = `No diagnoses on record`;
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

                tbody.appendChild(row);  // Append the row to the tbody instead of the table
            }
        }

        table.appendChild(tbody);  // Append the tbody to the table
        patientTableDiv.appendChild(table);
        // Add a horizontal line after each diagnosis
        let hr = document.createElement('br');
        patientTableDiv.appendChild(hr);
    }
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
    }

    if (field === 'diagnoses') {
        fieldNames = {
            'PatientID': 'Patient',
            'PhysicianID': 'Physician',
            'DateOfDiagnosis': 'Diagnosis Date',
            'IllnessID': 'Illness'
        };

        fieldOrder = ['PhysicianID', 'DateOfDiagnosis', 'IllnessID'];
    }

    if (field === 'consultations') {
        fieldNames = {
            'PatientID': 'Patient',
            'PhysicianID': 'Physician',
            'ConsultationType': 'Consultation Type',
            'DateOfConsult': 'Date of Consult',
            'Notes': 'Notes'
        };

        fieldOrder = ['PhysicianID', 'DateOfConsult','ConsultationType', 'Notes'];
    }

    return {fieldNames, fieldOrder};
}