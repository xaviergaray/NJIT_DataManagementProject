from flask import Flask, render_template, request
import mysql.connector

main = Flask(__name__, template_folder='.', static_folder='.', static_url_path='')

# Configure MySQL connection
db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="root",
    database="njit_datamgmt"
)

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

    # Create a cursor
    cursor = db.cursor()

    # Insert data into the database
    sql = "INSERT INTO Patients (ID, Name, Illness, Allergies, RoomNumber, BedNumber, NurseID, PhysicianID, DateOfBirth, BloodType, HDL, LDL, Triglycerides, BloodSugar, SocialSecurityNumber, AdmissionDate, NursingUnit) VALUES (%s, %s, %s, %s, NULL, NULL, NULL, NULL, %s, NULL, NULL, NULL, NULL, NULL, %s, NULL, NULL)"
    val = (1, name, dob, contact, dob, contact)
    cursor.execute(sql, val)

    # Commit the transaction
    db.commit()

    return "Patient added successfully!"

if __name__ == "__main__":
    main.run(debug=True)
