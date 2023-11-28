import argparse
import mysql.connector
from random import randint
from datetime import datetime, timedelta

# Configure MySQL connection
db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="root",
    database="njit_datamgmt"
)

cursor = db.cursor()

def initializeBedsTable(beds):
    # Check if there are already items in the table
    cursor.execute("SELECT COUNT(*) FROM BedLocation")
    count = cursor.fetchone()[0]
    if count > 0:
        print(f"There are already {count} rows in the BedLocation table. Overriding this table...")
        cursor.execute("DELETE FROM BedLocation")

    nursingUnits = 7
    bedsPerUnit = beds // nursingUnits
    extraBeds = beds % nursingUnits

    for i in range(1, beds + 1):
        # Determine the nursing unit and bed within the unit based on the ID
        nursingUnit = ((i - 1) // (bedsPerUnit + 1)) + 1 if i <= extraBeds * (bedsPerUnit + 1) else ((i - extraBeds) // bedsPerUnit) + 1

        bedInUnit = ((i - 1) % (bedsPerUnit + 1)) + 1 if i <= extraBeds * (bedsPerUnit + 1) else ((i - extraBeds - 1) % bedsPerUnit) + 1

        # Determine the wing and bed number based on the ID
        wing = 'Blue' if i <= beds / 2 else 'Green'
        bedNumber = 'A' if i % 2 == 1 else 'B'

        # Calculate the room number, incrementing it every two beds and resetting it for each unit
        roomNumber = 100 + ((bedInUnit + 1) // 2)
        nursingUnit = 7 if nursingUnit > 7 else nursingUnit

        # Insert a row into the BedLocation table
        sql = "INSERT INTO BedLocation (ID, NursingUnit, Wing, RoomNumber, BedNumber) VALUES (%s, %s, %s, %s, %s)"
        val = (i, nursingUnit, wing, roomNumber, bedNumber)
        cursor.execute(sql, val)

    # Commit the transaction
    db.commit()

    print(f"{beds} rows inserted successfully!")

def addPatients(patients):
    # Check if there are already items in the table
    cursor.execute("SELECT COUNT(*) FROM Patients")
    count = cursor.fetchone()[0]
    if count > 0:
        print(f"There are already {count} rows in the Patients table. Overriding this table...")
        cursor.execute("DELETE FROM Patients")

    # Get the list of available BedIDs
    cursor.execute("SELECT ID FROM BedLocation")
    availableBedIDs = [row[0] for row in cursor.fetchall()]

    # Get the list of available NurseIDs
    cursor.execute("SELECT ID From Nurses")
    availableNurseIDs = [row[0] for row in cursor.fetchall()]

    if len(availableBedIDs) < patients:
        print(f"There are only {len(availableBedIDs)} beds available, but {patients} patients to insert. Please add more beds first.")
        return

    for i in range(1, patients + 1):
        # Generate random patient data
        name = f"Patient {i}"
        illness = f"Illness {i}"
        allergies = f"Allergies {i}"
        bedID = availableBedIDs.pop(randint(0, len(availableBedIDs) - 1))
        nurseID = availableNurseIDs.pop(randint(0, len(availableNurseIDs) - 1))
        physicianID = randint(1, 10)  # Replace with actual range of physician IDs
        dob = datetime.now() - timedelta(days=randint(18*365, 100*365))  # Random date of birth between 18 and 100 years ago
        bloodType = 'A'  # Replace with actual blood type
        hdl = randint(40, 60)
        ldl = randint(100, 130)
        triglycerides = randint(150, 200)
        bloodSugar = randint(70, 100)
        ssn = f"{randint(100, 999)}-{randint(10, 99)}-{randint(1000, 9999)}"  # Randomly generated SSN, replace with actual SSN
        admissionDate = datetime.now()
        nursingUnit = randint(1, 7)

        # Insert a row into the Patients table
        sql = "INSERT INTO Patients (ID, Name, Illness, Allergies, BedID, NurseID, PhysicianID, DateOfBirth, BloodType, HDL, LDL, Triglycerides, BloodSugar, SocialSecurityNumber, AdmissionDate, NursingUnit) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"
        val = (i, name, illness, allergies, bedID, nurseID, physicianID, dob, bloodType, hdl, ldl, triglycerides, bloodSugar, ssn, admissionDate, nursingUnit)
        cursor.execute(sql, val)

    # Commit the transaction
    db.commit()

    print(f"{patients} patients inserted successfully!")

def addPersonnel(personnel):
    # Check if there are already items in the table
    cursor.execute("SELECT COUNT(*) FROM Personnel")
    count = cursor.fetchone()[0]
    if count > 0:
        print(f"There are already {count} rows in the Personnel table. Overriding this table...")
        cursor.execute("DELETE FROM Personnel")

    for i in range(1, personnel + 1):
        # Generate random personnel data
        name = f"Personnel {i}"
        role = "Role"
        salary = 50000.00
        isOwner = False
        isSurgeon = False
        employmentNumber = i
        gender = 'M'
        address = "Address"
        telephoneNumber = "123-456-7890"
        ssn = f"{randint(100, 999)}-{randint(10, 99)}-{randint(1000, 9999)}"  # Randomly generated SSN, replace with actual SSN

        # Insert a row into the Personnel table
        sql = "INSERT INTO Personnel (ID, Name, Role, Salary, IsOwner, IsSurgeon, EmploymentNumber, Gender, Address, TelephoneNumber, SocialSecurityNumber) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"
        val = (i, name, role, salary, isOwner, isSurgeon, employmentNumber, gender, address, telephoneNumber, ssn)
        cursor.execute(sql, val)

        # Commit the transaction
    db.commit()

    print(f"{personnel} personnel inserted successfully!")

def addSurgeons(surgeons):
    # Check if there are already items in the table
    cursor.execute("SELECT COUNT(*) FROM Surgeons")
    count = cursor.fetchone()[0]
    if count > 0:
        print(f"There are already {count} rows in the Surgeons table. Overriding this table...")
        cursor.execute("DELETE FROM Surgeons")

    # Get the list of available Personnel IDs
    cursor.execute("SELECT ID FROM Personnel")
    availablePersonnelIDs = [row[0] for row in cursor.fetchall()]

    if len(availablePersonnelIDs) < surgeons:
        print(
            f"There are only {len(availablePersonnelIDs)} personnel available, but {surgeons} surgeons to insert. Please add more personnel first.")
        return


    for i in range(1, surgeons + 1):
        # Generate random surgeon data
        id = availablePersonnelIDs.pop(randint(0, len(availablePersonnelIDs) - 1))
        specialty = f"Specialty {i}"
        contractType = "Contract Type"
        contractLength = 1

        # Insert a row into the Surgeons table
        sql = "INSERT INTO Surgeons (ID, Specialty, ContractType, ContractLength) VALUES (%s, %s, %s, %s)"
        val = (id, specialty, contractType, contractLength)
        cursor.execute(sql, val)

    # Commit the transaction
    db.commit()

    print(f"{surgeons} surgeons inserted successfully!")

def addSurgeryTypes(surgeryTypes):
    # Check if there are already items in the table
    cursor.execute("SELECT COUNT(*) FROM SurgeryTypes")
    count = cursor.fetchone()[0]
    if count > 0:
        print(f"There are already {count} rows in the SurgeryTypes table. Overriding this table...")
        cursor.execute("DELETE FROM SurgeryTypes")

    cursor.execute("SELECT ID FROM Surgeons")
    availableSurgeonIDs = [row[0] for row in cursor.fetchall()]

    if len(availableSurgeonIDs) < surgeryTypes:
        print(
            f"There are only {len(availableSurgeonIDs)} surgeons available, but {surgeryTypes} surgery types to insert. Please add more surgeons first.")
        return

    for i in range(1, surgeryTypes + 1):
        # Generate random surgery type data
        name = f"Surgery Type {i}"
        surgeonID = availableSurgeonIDs.pop(randint(0, len(availableSurgeonIDs) - 1))
        category = 'A'
        anatomicalLocation = "Anatomical Location"
        specialNeeds = "Special Needs"

        # Insert a row into the SurgeryTypes table
        sql = "INSERT INTO SurgeryTypes (ID, Name, SurgeonID, Category, AnatomicalLocation, SpecialNeeds) VALUES (%s, %s, %s, %s, %s, %s)"
        val = (i, name, surgeonID, category, anatomicalLocation, specialNeeds)
        cursor.execute(sql, val)

    # Commit the transaction
    db.commit()

    print(f"{surgeryTypes} surgery types inserted successfully!")

def addNurses(nurses):
    # Get the list of available SurgeryTypeIDs
    cursor.execute("SELECT ID FROM SurgeryTypes")
    availableSurgeryTypeIDs = [row[0] for row in cursor.fetchall()]

    if len(availableSurgeryTypeIDs) < nurses:
        print(
            f"There are only {len(availableSurgeryTypeIDs)} surgery types available, but {nurses} nurses to insert. Please add more surgery types first.")
        return

    for i in range(1, nurses + 1):
        # Generate random nurse data
        surgeryTypeID = availableSurgeryTypeIDs.pop(randint(0, len(availableSurgeryTypeIDs) - 1))
        grade = 1
        yearsOfExperience = 1

        # Insert a row into the Nurses table
        sql = "INSERT INTO Nurses (ID, SurgeryTypeID, Grade, YearsOfExperience) VALUES (%s, %s, %s, %s)"
        val = (i, surgeryTypeID, grade, yearsOfExperience)
        cursor.execute(sql, val)

    # Commit the transaction
    db.commit()

    print(f"{nurses} nurses inserted successfully!")


if __name__ == "__main__":
    # Parse command-line arguments
    parser = argparse.ArgumentParser(description='Initialize the BedLocation, Patients, Personnel, Surgeons, SurgeryTypes, and Nurses tables with a specified number of beds, patients, personnel, surgeons, surgery types, and nurses.')
    parser.add_argument('-beds', type=int, help='the number of beds to insert')
    parser.add_argument('-patients', type=int, help='the number of patients to insert')
    parser.add_argument('-personnel', type=int, help='the number of personnel to insert')
    parser.add_argument('-surgeons', type=int, help='the number of surgeons to insert')
    parser.add_argument('-surgeryTypes', type=int, help='the number of surgery types to insert')
    parser.add_argument('-nurses', type=int, help='the number of nurses to insert')
    args = parser.parse_args()

    # Initialize the rows
    if args.beds is not None:
        initializeBedsTable(args.beds)
    if args.patients is not None:
        addPatients(args.patients)
    if args.personnel is not None:
        addPersonnel(args.personnel)
    if args.surgeons is not None:
        addSurgeons(args.surgeons)
    if args.surgeryTypes is not None:
        addSurgeryTypes(args.surgeryTypes)
    if args.nurses is not None:
        addNurses(args.nurses)