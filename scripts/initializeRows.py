import argparse
import mysql.connector
import random
from datetime import datetime, timedelta

# Configure MySQL connection
db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="root",
    database="njit_datamgmt"
)

cursor = db.cursor()

def randomDate(start, end):
    return (start + timedelta(seconds=random.randint(0, int((end - start).total_seconds())))).strftime('%Y-%m-%d')
def overrideTable(table):
    cursor.execute(f"SELECT COUNT(*) FROM {table}")
    count = cursor.fetchone()[0]
    if count > 0:
        print(f"There are already {count} rows in the {table} table. Overriding this table...")
        cursor.execute(f"DELETE FROM {table}")

def initializeBedsTable(beds):
    # Check if there are already items in the table
    overrideTable('ClinicBed')

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
        sql = "INSERT INTO ClinicBed (ID, NursingUnit, Wing, RoomNumber, BedLetter) VALUES (%s, %s, %s, %s, %s)"
        val = (i, nursingUnit, wing, roomNumber, bedNumber)
        cursor.execute(sql, val)

    # Commit the transaction
    db.commit()

    print(f"{beds} rows inserted successfully!")

def initializePatients(patients):
    overrideTable('Patient')

    # Create a list of bed IDs
    cursor.execute("SELECT ID FROM ClinicBed")
    bed_ids = [row[0] for row in cursor.fetchall()]

    # Randomly assign patients to beds
    for patientID in range(1, patients + 1):
        if bed_ids:
            assigned_bed = random.choice(bed_ids)
            bed_ids.remove(assigned_bed)
            sql = "INSERT INTO Patient (ID, Name, Gender, DOB, Address, PhoneNumber, SocialSecurityNumber, BedID, AdmissionDate, AdmissionDuration, PrimaryPhysicianID) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"
            val = (patientID,
                   f"Patient {patientID}",
                   random.choice(['M','F']),
                   randomDate(datetime(1930,1,1), datetime.now()),
                   f"Random Address {patientID}",
                   f"({random.randint(100,999)}) {random.randint(100,999)}-{random.randint(1000,9999)}",
                   f"{random.randint(100, 999)}-{random.randint(10, 99)}-{random.randint(1000, 9999)}",
                   assigned_bed,
                   randomDate(datetime.now() - timedelta(days=10), datetime.now()),
                   None,
                   None
                   )
            cursor.execute(sql, val)
            print(f"Patient {patientID} has been assigned to bed {assigned_bed}")
        else:
            print(f"No more beds available. Patient {patientID} could not be assigned a bed")

    # Commit the transaction
    db.commit()

def initializeEmployees(employees):
    overrideTable('Employee')

    # Randomly create employees with specific IDs
    for employeeID in range(1, employees + 1):
        sql = "INSERT INTO Employee (ID, Name, Gender, Address, TelephoneNumber, Role, Salary, SocialSecurityNumber) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)"
        val = (employeeID,
               f"Employee {employeeID}",
               random.choice(['M', 'F']),
               f"Random Address {employeeID}",
               f"({random.randint(100, 999)}) {random.randint(100, 999)}-{random.randint(1000, 9999)}",
               None,
               f"{random.randint(10000,150000)}",
               f"{random.randint(100, 999)}-{random.randint(10, 99)}-{random.randint(1000, 9999)}"
               )
        cursor.execute(sql, val)

    print(f"{employees} successfully added to Employee table")
    # Commit the transaction
    db.commit()

def initializeNurses(nurses):
    overrideTable('Nurse')

    # Create a list of employee IDs without roles
    cursor.execute("SELECT ID FROM Employee WHERE Role IS NULL")
    EIDs = [row[0] for row in cursor.fetchall()]

    # Randomly assign available EIDs to nurses
    for nurse in range(1, nurses + 1):
        if EIDs:
            assigned_EID = random.choice(EIDs)
            EIDs.remove(assigned_EID)
            sql = "INSERT INTO Nurse (ID, SurgeryTypeID, Grade, YearsOfExperience) VALUES (%s, %s, %s, %s)"
            val = (assigned_EID,
                   None,
                   random.choice(['CNA','LPN','RN','APRN','DNP']),
                   random.randint(1,20)
                   )
            cursor.execute(sql, val)
            print(f"Nurse {nurse} has been assigned to employee ID {assigned_EID}")
        else:
            print(f"No more employee IDs available. Nurse {nurse} could not be assigned a position")

    # Commit the transaction
    db.commit()

def initializePhysicians(physicians):
    overrideTable('Physician')

    # Create a list of employee IDs without roles
    cursor.execute("SELECT ID FROM Employee WHERE Role IS NULL")
    EIDs = [row[0] for row in cursor.fetchall()]

    # Randomly assign available EIDs to nurses
    for physician in range(1, physicians + 1):
        if EIDs:
            assigned_EID = random.choice(EIDs)
            EIDs.remove(assigned_EID)
            sql = "INSERT INTO Physician (ID, Specialty, FieldType, PercentOwnership) VALUES (%s, %s, %s, %s)"
            val = (assigned_EID,
                   random.choice(['Internal Medicine', 'Pediatrics', 'Ophthalmology', 'Family Medicine', 'Orthopedics']),
                   None,
                   random.randint(0, 20)
                   )
            cursor.execute(sql, val)
            print(f"Physician {physician} has been assigned to employee ID {assigned_EID}")
        else:
            print(f"No more employee IDs available. Physician {physician} could not be assigned a position")

    # Commit the transaction
    db.commit()

def initializeRelationships(rel1, rel2, n):
    if rel1 == 'patient' or rel2 == 'patient':
        if rel1 == 'nurse' or rel2 == 'nurse':
            table = 'PatientAssignedNurse'
            sql = f"INSERT INTO {table} (NurseID, PatientID, Shift, DateOfCare) VALUES (%s, %s, %s, %s)"

    overrideTable(f'{table}')

    # Create a list of rel1 IDs
    cursor.execute(f"SELECT ID FROM {rel1};")
    rel1IDs = [row[0] for row in cursor.fetchall()]

    # Create a list of rel2 IDs
    cursor.execute(f"SELECT ID FROM {rel2};")
    rel2IDs = [row[0] for row in cursor.fetchall()]

    # Randomly assign available rel1 to rel2
    for relationship in range(0, n):
        if rel1IDs and rel2IDs:
            assigned_rel1 = random.choice(rel1IDs)
            assigned_rel2 = random.choice(rel2IDs)

            if table == 'PatientAssignedNurse':
                val = (assigned_rel1,
                       assigned_rel2,
                       random.randint(1,3),
                       randomDate(datetime(1930, 1, 1), datetime.now()))
            else:
                val = (assigned_rel1,
                       assigned_rel2)
            try:
                cursor.execute(sql, val)
            except mysql.connector.Error as e:
                if table == 'PatientAssignedNurse':
                    val = (assigned_rel2,
                           assigned_rel1,
                           random.randint(1, 3),
                           randomDate(datetime(1930, 1, 1), datetime.now()))
                else:
                    val = (assigned_rel2,
                           assigned_rel1)
                try:
                    cursor.execute(sql, val)
                except:
                    continue
        else:
            if rel1IDs:
                print(f'Error: there are no more IDs in {rel2}')
                return
            else:
                print(f'Error: there are no more IDs in {rel1}')
                return

    print(f"Successfully created {n} relationships.")
    # Commit the transaction
    db.commit()


if __name__ == "__main__":
    # Parse command-line arguments
    parser = argparse.ArgumentParser(description='Initialize the ClinicBed, Patient, Employee, Surgeon, SurgeryType, and Nurse tables with a specified number of beds, patients, personnel, surgeons, surgery types, and nurses.')
    parser.add_argument('-beds', type=int, help='the number of beds to insert')
    parser.add_argument('-patients', type=int, help='the number of patients to insert')
    parser.add_argument('-employees', type=int, help='the number of employees to insert')
    parser.add_argument('-nurses', type=int, help='the number of nurses to insert')
    parser.add_argument('-physicians', type=int, help='the number of physicians to insert')
    parser.add_argument('-relationship', nargs=3, metavar=('rel1', 'rel2', 'n'), help='takes 3 arguments: rel1 and rel2 for the relationships and n for the amount')
    args = parser.parse_args()

    # Initialize the rows
    if args.beds is not None:
        initializeBedsTable(args.beds)
    if args.patients is not None:
        initializePatients(args.patients)
    if args.employees is not None:
        initializeEmployees(args.employees)
    if args.nurses is not None:
        initializeNurses(args.nurses)
    if args.relationship is not None:
        rel1 = args.relationship[0]
        rel2 = args.relationship[1]
        n = int(args.relationship[2])
        initializeRelationships(rel1, rel2, n)
    if args.physicians is not None:
        initializePhysicians(args.physicians)
