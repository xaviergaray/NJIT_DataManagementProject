from flask import Flask, render_template, request, jsonify
import mysql.connector

main = Flask(__name__, template_folder='.', static_folder='.', static_url_path='')

# Configure MySQL connection
db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="root",
    database="njit_datamgmt"
)

cursor = db.cursor()

@main.route('/')
def index():
    return render_template('index.html')

@main.route('/patient/')
def patient_management():
    return render_template('patient/PatientManagement.html')

@main.route('/inpatient/')
def inpatient_management():
    return render_template('inpatient/InpatientManagement.html')

@main.route('/inpatient/patients')
def inpatient_management_patients():
    return render_template('inpatient/Patients.html')

@main.route('/inpatient/surgeries')
def inpatient_management_staff():
    return render_template('inpatient/Surgeries.html')

@main.route('/inpatient/rooms')
def inpatient_management_rooms():
    return render_template('inpatient/Rooms.html')

@main.route('/staff/')
def medical_staff_management():
    return render_template('staff/MedicalStaffManagement.html')

@main.route('/patient/PatientManagement/add_patient', methods=['POST'])
def add_patient():
    # Get form data
    name = request.form.get('name')
    dob = request.form.get('dob')
    contact = request.form.get('contact')

    # Insert data into the database
    sql = "INSERT INTO Patients (ID, Name, Illness, Allergies, BedID, NurseID, PhysicianID, DateOfBirth, BloodType, HDL, LDL, Triglycerides, BloodSugar, SocialSecurityNumber, AdmissionDate, NursingUnit) VALUES (%s, %s, %s, %s, NULL, NULL, NULL, %s, NULL, NULL, NULL, NULL, NULL, %s, NULL, NULL)"
    val = (1, name, dob, contact, dob, contact)
    cursor.execute(sql, val)

    # Commit the transaction
    db.commit()

    return "Patient added successfully!"

@main.route('/get-beds')
def get_beds():
    cursor.execute("SELECT * FROM ClinicBed")
    beds = cursor.fetchall()
    # Convert the list of tuples to a list of dictionaries
    beds = [dict(zip([column[0] for column in cursor.description], row)) for row in beds]
    return jsonify(beds)

@main.route('/set-patient-info', methods=['POST'])
def remove_patient_by_bed_id():
    # Get form data
    id = request.form.get('patientID')
    param = request.form.get('param')
    value = request.form.get('value')

    # Insert data into the database
    sql = f"UPDATE Patient SET {param} = {value} WHERE ID = {id};"
    cursor.execute(sql)

    # Commit the transaction
    db.commit()

    return f"Patient #{id}'s {param} set to {value}"

@main.route('/remove-patient-relationship', methods=['POST'])
def remove_patient_relationship():
    # Get form data
    patientID = request.form.get('patientID')
    otherID = request.form.get('otherID')
    param = request.form.get('param')

    if param[-2:] == 'ID' or param[-2:] == 'id':
        param = param[:-2]

    print(param)
    # Insert data into the database
    sql = f"DELETE FROM PatientAssigned{param} WHERE PatientID = {patientID} AND {param}ID = {otherID};"
    cursor.execute(sql)

    # Commit the transaction
    db.commit()

    return f"Removed the relationship between patient {patientID} and employee with {param} {otherID}"


@main.route('/get-patient-by-bed-id/<int:bedID>')
def get_patient_by_bed_id(bedID):
    patients = get_patients()

    for patient in patients:
        if patient['BedID'] == bedID:
            return patient

    return {"Name": "None"}

@main.route('/get-patient/', methods=['POST'])
def get_patient():
    # Get form data
    id = request.form.get('ID')
    cursor.execute(f"SELECT * FROM Patient WHERE ID={id};")
    patient = cursor.fetchall()

    return patient

@main.route('/get-patient-nurse-relationship', methods=['POST'])
def get_patients_nurse_relationship():
    # Get form data
    patientID = request.form.get('patientID')
    nurseID = request.form.get('nurseID')

    # Start building the SQL query
    query = "SELECT * FROM PatientAssignedNurse WHERE "

    # Add conditions to the query based on provided data
    conditions = []
    if patientID is not None:
        conditions.append(f"PatientID={patientID}")
    if nurseID is not None:
        conditions.append(f"NurseID={nurseID}")

    # If no conditions were added, remove the WHERE clause
    if conditions:
        query += " AND ".join(conditions)
    else:
        query = "SELECT * FROM PatientAssignedNurse"

    cursor.execute(query)
    relationships = cursor.fetchall()

    # Convert the list of tuples to a list of dictionaries
    relationships = [dict(zip([column[0] for column in cursor.description], row)) for row in relationships]

    return relationships

@main.route('/get-patient-physician-relationship', methods=['POST'])
def get_patients_physician_relationship():
    # Get form data
    patientID = request.form.get('patientID')
    physicianID = request.form.get('physicianID')

    # Start building the SQL query
    query = "SELECT * FROM PatientAssignedPhysician WHERE "

    # Add conditions to the query based on provided data
    conditions = []
    if patientID is not None:
        conditions.append(f"PatientID={patientID}")
    if physicianID is not None:
        conditions.append(f"PhysicianID={physicianID}")

    # If no conditions were added, remove the WHERE clause
    if conditions:
        query += " AND ".join(conditions)
    else:
        query = "SELECT * FROM PatientAssignedPhysician"

    cursor.execute(query)
    relationships = cursor.fetchall()

    # Convert the list of tuples to a list of dictionaries
    relationships = [dict(zip([column[0] for column in cursor.description], row)) for row in relationships]

    return relationships

@main.route('/assign-physician', methods=['POST'])
def assign_physician():
    # Get form data
    patientID = request.form.get('patientID')
    physicianID = request.form.get('physicianID')

    # Insert the new relationship into the database
    query = f"INSERT INTO PatientAssignedPhysician (PatientID, PhysicianID) VALUES ('{patientID}', '{physicianID}')"
    cursor.execute(query)

    # Commit the transaction
    db.commit()

    return 'Success'

@main.route('/assign-nurse', methods=['POST'])
def assign_nurse():
    # Get form data
    patientID = request.form.get('patientID')
    nurseID = request.form.get('nurseID')
    shift = request.form.get('shift')
    dateOfCare = request.form.get('dateOfCare')

    # Insert the new relationship into the database
    query = f"INSERT INTO PatientAssignedNurse (NurseID, PatientID, Shift, DateOfCare) VALUES ('{nurseID}', '{patientID}', '{shift}', '{dateOfCare}')"
    cursor.execute(query)

    # Commit the transaction
    db.commit()

    return 'Success'

@main.route('/get-medical-data', methods=['POST'])
def get_medical_data():
    # Get form data
    patientID = request.form.get('patientID')

    query = "SELECT * FROM PatientAssignedPhysician"
    if(patientID):
        query += f" WHERE PatientID={patientID}"

    cursor.execute(query)
    medicalData = cursor.fetchall()

    medicalData = [dict(zip([column[0] for column in cursor.description], row)) for row in medicalData]

    return medicalData

@main.route('/get-patients')
def get_patients():
    cursor.execute("SELECT * FROM Patient")
    patients = cursor.fetchall()

    # Convert the list of tuples to a list of dictionaries
    patients = [dict(zip([column[0] for column in cursor.description], row)) for row in patients]

    return patients

@main.route('/get-physician')
def get_physicians():
    cursor.execute("SELECT * FROM Physician")
    physicians = cursor.fetchall()

    # Convert the list of tuples to a list of dictionaries
    physicians = [dict(zip([column[0] for column in cursor.description], row)) for row in physicians]

    return physicians

@main.route('/get-nurse')
def get_nurses():
    cursor.execute("SELECT * FROM Nurse")
    nurses = cursor.fetchall()

    # Convert the list of tuples to a list of dictionaries
    nurses = [dict(zip([column[0] for column in cursor.description], row)) for row in nurses]

    return nurses

@main.route('/get-employee', methods=['POST'])
def get_employee():
    # Get form data
    EID = request.form.get('EID')

    query = f"SELECT * FROM Employee WHERE ID={EID};"
    cursor.execute(query)

    # Use fetchone to get a single row
    employee = cursor.fetchone()

    if employee:
        # Convert the result to a dictionary
        employee_dict = dict(zip([column[0] for column in cursor.description], employee))
        return employee_dict
    else:
        # Handle the case where no employee is found
        return {"error": "Employee not found"}

@main.route('/get-surgery')
def get_surgery():
    cursor.execute("SELECT * FROM Surgery")
    surgeries = cursor.fetchall()

    # Convert the list of tuples to a list of dictionaries
    surgeries = [dict(zip([column[0] for column in cursor.description], row)) for row in surgeries]

    return surgeries

@main.route('/get-surgery-types')
def get_surgery_types():
    cursor.execute("SELECT * FROM SurgeryType")
    surgeryTypes = cursor.fetchall()

    # Convert the list of tuples to a list of dictionaries
    surgeryTypes = [dict(zip([column[0] for column in cursor.description], row)) for row in surgeryTypes]

    return surgeryTypes

@main.route('/get-surgeon')
def get_surgeon():
    cursor.execute("SELECT * FROM Surgeon")
    surgeons = cursor.fetchall()

    # Convert the list of tuples to a list of dictionaries
    surgeons = [dict(zip([column[0] for column in cursor.description], row)) for row in surgeons]

    return surgeons

@main.route('/get-employees')
def get_employees():
    cursor.execute("SELECT * FROM Employee")
    employees = cursor.fetchall()

    # Convert the list of tuples to a list of dictionaries
    employees = [dict(zip([column[0] for column in cursor.description], row)) for row in employees]

    return employees

@main.route('/get-support-staff')
def get_support_staff():
    cursor.execute("SELECT * FROM SupportStaff")
    supportStaff = cursor.fetchall()

    # Convert the list of tuples to a list of dictionaries
    supportStaff = [dict(zip([column[0] for column in cursor.description], row)) for row in supportStaff]

    return supportStaff

@main.route('/edit-surgery', methods=['POST'])
def edit_surgery():
    # Get form data
    SurgeryTypeID = request.form.get('SurgeryTypeID')
    SurgeonID = request.form.get('SurgeonID')
    PatientID = request.form.get('PatientID')
    SurgeryDate = request.form.get('SurgeryDate')
    EditType = request.form.get('EditType')

    if EditType == 'remove':
        query = f"DELETE FROM Surgery WHERE SurgeryTypeID='{SurgeryTypeID}' AND SurgeonID={SurgeonID} AND PatientID={PatientID};"
    elif EditType == 'reschedule':
        query = f"UPDATE Surgery SET SurgeryDate='{SurgeryDate}' WHERE SurgeryTypeID={SurgeryTypeID} AND SurgeonID={SurgeonID} AND PatientID={PatientID};"
    elif EditType == 'reassign':
        NewSurgeonID = request.form.get('NewSurgeonID')
        query = f"UPDATE Surgery SET SurgeonID={NewSurgeonID} WHERE SurgeryTypeID={SurgeryTypeID} AND SurgeonID={SurgeonID} AND PatientID={PatientID};"
    elif EditType == 'assign':
        NewOR = request.form.get('NewOR')
        query = f"INSERT INTO Surgery (SurgeryTypeID, SurgeonID, PatientID, OperationTheatreNumber, SurgeryDate) VALUES ({SurgeryTypeID}, {SurgeonID}, {PatientID}, '{NewOR}', '{SurgeryDate}');"

    cursor.execute(query)

    # Commit the transaction
    db.commit()

    return 'Success'


if __name__ == "__main__":
    main.run(debug=True)
