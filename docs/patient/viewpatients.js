let physicians;
let diagnoses;
let consultations;
let employees;
let patients;
let screen;

window.onload = async function() {
    screen = 0;

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

    // Get the select element
    let selectPhys = document.getElementById("pcp");

    // Add each physician as an option
    for (var i = 0; i < physicians.length; i++) {
        var option = document.createElement("option");
        option.value = physicians[i].ID;
        option.text = getName(physicians[i].ID, 'employee');
        selectPhys.appendChild(option);
    }

    document.getElementById('patientForm').addEventListener('submit', function(event) {
            event.preventDefault();

            var patientName = document.getElementsByName('name')[0].value;
            var contact = document.getElementById('contact').value;

            // Remove non-digit characters from the phone number
            var digits = contact.replace(/\D/g, '');

            // Convert the phone number to the format (123) 456-7890
            var formattedContact = '(' + digits.slice(0, 3) + ') ' + digits.slice(3, 6) + '-' + digits.slice(6);

            // Update the contact field with the formatted phone number
            if(document.getElementById('contact').value)
            document.getElementById('contact').value = formattedContact;

            // Create a new FormData object from the form
            var formData = new FormData(this);

            // Send the form data to the server using an AJAX request
            fetch(this.action, {
                method: this.method,
                body: formData
            })
            .then(function(response) {
                if (response.ok) {
                    return response.text();
                } else {
                    throw new Error('Error: ' + response.statusText);
                }
            })
            .then(function(text) {
                alert('Patient added: ' + patientName + '\n\n' + text);

                // Fetch the updated list of patients from the server
                fetch('/get-patients')
                .then(response => response.json())
                .then(updatedPatients => {
                    patients = updatedPatients;

                    // Store the currently selected patient's ID
                    let selectedPatientID = document.getElementById('selectPatient').value;

                    // Clear the existing options in the dropdown
                    let select = document.getElementById('selectPatient');
                    while (select.firstChild) {
                        select.removeChild(select.firstChild);
                    }

                    // Populate the dropdown with the updated list of patients
                    for(let patient of patients) {
                        let option = document.createElement('option');
                        option.value = patient.ID;
                        option.text = patient.Name;

                        select.appendChild(option);
                    }

                    // Set the selected option back to the previously selected patient
                    select.value = selectedPatientID;
                });
            })
            .catch(function(error) {
                alert('There was an error: ' + error.message);
            });
        });

    let select = document.createElement('select');
    select.id = 'selectPatient';
    select.onchange = function() {
        let relationshipLinks = document.getElementById('relationships');
        while (relationshipLinks.firstChild) {
            relationshipLinks.removeChild(relationshipLinks.firstChild);
        }

        selectedPatientID = this.value;
        createPatientTable(patients, selectedPatientID,  'patient');
        let parentElement = document.getElementById('userInputRow');
    }

    for(let patient of patients) {
        let option = document.createElement('option');
        option.value = patient.ID;
        option.text = patient.Name;

        select.appendChild(option);
    }

    createPatientTable(patients, selectedPatientID,  'patient');

    let parentElement = document.getElementById('userInputRow');

    let patientInfoTableLink = document.createElement('a');
    patientInfoTableLink.textContent = 'Patient Information';
    patientInfoTableLink.href = '#';
    patientInfoTableLink.onclick = function() {
        createPatientTable(patients, selectedPatientID, 'patient');
        return false;
    };

    let diagnosesTableLink = document.createElement('a');
    diagnosesTableLink.textContent = 'Diagnoses';
    diagnosesTableLink.href = '#';
    diagnosesTableLink.onclick = function() {
        createPatientTable(diagnoses, selectedPatientID, 'diagnoses');
        return false;
    };

    let consultationsTableLink = document.createElement('a');
    consultationsTableLink.textContent = 'Appointments';
    consultationsTableLink.href = '#';
    consultationsTableLink.onclick = function() {
        createPatientTable(consultations, selectedPatientID, 'consultations');
        return false;
    };

    parentElement.appendChild(patientInfoTableLink);
    parentElement.appendChild(diagnosesTableLink);
    parentElement.appendChild(consultationsTableLink);

    document.getElementById('patientSelect').appendChild(select);
    var modal = document.getElementById("myModal");
    var btn = document.getElementById("scheduleButton");
    var span = document.getElementsByClassName("close")[0];

    btn.onclick = function() {
      modal.style.display = "block";
    }

    span.onclick = function() {
      modal.style.display = "none";
    }

    window.onclick = function(event) {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    }

    let selectPhys2 = document.getElementById('physician');
    for(let physician of physicians) {
        let option = document.createElement('option');
        option.value = physician.ID;
        option.text = getName(physician.ID, 'employee');

        selectPhys2.appendChild(option);
    }

    document.getElementById('appointmentForm').addEventListener('submit', function(event) {
    event.preventDefault();

    var physician = document.getElementById('physician').value;
    var date = document.getElementById('date').value;
    var reason = document.getElementById('reason').value;

    // Create a new FormData object from the form
    var formData = new FormData(this);
    formData.append('patientID', selectedPatientID);
    formData.append('physicianID', physician);

    // Send the form data to the server using an AJAX request
    fetch('/set-consultation', {
        method: 'POST',
        body: formData
    })
    .then(function(response) {
        if (response.ok) {
            return response.text();
        } else {
            throw new Error('Error: ' + response.statusText);
        }
    })
    .then(function(text) {
        alert('Consultation set: ' + '\n\n' + text);

        // Fetch the updated list of consultations from the server
        fetch('/get-consultation')
        .then(response => response.json())
        .then(updatedConsultations => {
            consultations = updatedConsultations;

            if (screen === 2)
            {
                createPatientTable(consultations, selectedPatientID, 'consultations');
            }

        });
    })
    .catch(function(error) {
        alert('There was an error: ' + error.message);
    });

    // Close the modal
    document.getElementById('myModal').style.display = 'none';
});
}

getName = function(ID, Table) {
    var name;
    var arrayToSearch;

    if (Table === 'patient') {
        arrayToSearch = patients;
    }
    else if (Table === 'employee') {
        arrayToSearch = employees;
    }
    else {
        console.log('Error: Table not found');
        return;
    }

    var matchedObject = arrayToSearch.find(p => p.ID === ID);

    if (matchedObject) {
        name = matchedObject.Name;
    } else {
        console.log(`Error: No ${Table} found with ID ${ID}`);
    }

    return name;
}

function createPatientTable(patients, patientID, fieldValuesTitle) {
    if (fieldValuesTitle === 'patient')
    {
        screen = 0;
    } else if (fieldValuesTitle === 'diagnoses')
    {
        screen = 1;
    } else
    {
        screen = 2;
    }

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
        cell.textContent = fieldValuesTitle === 'diagnoses' ? 'No diagnoses on record' : 'No appointments on record';
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
                if (key === 'PhysicianID') {
                    // Translate the physician ID to the employee name
                    cellValue.textContent = getName(patient[key], 'employee');
                } else {
                    cellValue.textContent = patient[key] || '';  // Use an empty string if the key is not in the data
                }
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
            'DateOfConsult': 'Appointment Date',
            'Notes': 'Notes'
        };

        fieldOrder = ['PhysicianID', 'DateOfConsult','ConsultationType', 'Notes'];
    }

    return {fieldNames, fieldOrder};
}