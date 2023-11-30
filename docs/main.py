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

@main.route('/patient/PatientManagement')
def patient_management():
    return render_template('patient/PatientManagement.html')

@main.route('/inpatient/InpatientManagement')
def inpatient_management():
    return render_template('inpatient/InpatientManagement.html')

@main.route('/staff/MedicalStaffManagement')
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
    sql = f"UPDATE Patient SET {param} WHERE ID = {id};"
    cursor.execute(sql)

    # Commit the transaction
    db.commit()

    return f"Patient #{id}'s {param} set to {value}"


@main.route('/get-patient-by-bed-id/<int:bedID>')
def get_patient_by_bed_id(bedID):
    patients = get_patients()

    for patient in patients:
        if patient['BedID'] == bedID:
            return patient

    return {"Name": "None"}

@main.route('/get-patients')
def get_patients():
    cursor.execute("SELECT * FROM Patient")
    patients = cursor.fetchall()

    # Convert the list of tuples to a list of dictionaries
    patients = [dict(zip([column[0] for column in cursor.description], row)) for row in patients]

    return patients

if __name__ == "__main__":
    main.run(debug=True)
