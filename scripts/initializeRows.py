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

    print(f"{beds} beds added successfully!")

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

    print(f'{patients} patients added successfully!')
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

    print(f"{employees} employees added successfully!")
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
        else:
            print("Could not add all requested nurses. Require more employees first.")

    print(f'{nurses} nurses added successfully!')
    # Commit the transaction
    db.commit()

def initializePhysicians(physicians):
    overrideTable('Physician')

    # Create a list of employee IDs without roles
    cursor.execute("SELECT ID FROM Employee WHERE Role IS NULL")
    EIDs = [row[0] for row in cursor.fetchall()]

    # Randomly assign available EIDs to physician
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
        else:
            print("Could not add all requested physicians. Require more employees first.")

    print(f'{physicians} physicians added successfully!')
    # Commit the transaction
    db.commit()

def initializeSurgeons(surgeons):
    overrideTable('Surgeon')

    # Create a list of physician IDs
    cursor.execute("SELECT ID FROM Physician")
    EIDs = [row[0] for row in cursor.fetchall()]

    # Randomly assign available EIDs to surgeon
    for surgeon in range(1, surgeons + 1):
        if EIDs:
            assigned_EID = random.choice(EIDs)
            EIDs.remove(assigned_EID)
            sql = "INSERT INTO Surgeon (ID, ContractType, ContractDuration, ContractAmount) VALUES (%s, %s, %s, %s)"
            val = (assigned_EID,
                   None,
                   random.randint(1,10),
                   random.randint(10, 20) * 30000
                   )
            cursor.execute(sql, val)
        else:
            print("Could not add all requested surgeons. Require more physicians first.")

    print(f'{surgeons} surgeons added successfully!')
    # Commit the transaction
    db.commit()

def initializeMedicalData(MedicalData):
    overrideTable('MedicalData')

    # Create a list of patient IDs
    cursor.execute("SELECT ID FROM Patient")
    IDs = [row[0] for row in cursor.fetchall()]

    for data in range(1, MedicalData + 1):
        if IDs:
            assigned_ID = random.choice(IDs)
            IDs.remove(assigned_ID)
            sql = "INSERT INTO MedicalData (PatientID, CreationDate, BloodType, HDL, LDL, Triglycerides, BloodSugar) VALUES (%s, %s, %s, %s, %s, %s, %s)"
            val = (assigned_ID,
                   randomDate(datetime.now() - timedelta(days=10), datetime.now()),
                   random.choice(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
                   random.randint(1,200),
                   random.randint(1,200),
                   random.randint(1, 200),
                   random.randint(1, 200)
                   )
            cursor.execute(sql, val)
        else:
            print(f'Could not add {MedicalData - data} records. Ensure there are enough patients to accomodate this amount')
            return

    print(f'{MedicalData} medical records added successfully!')
    # Commit the transaction
    db.commit()

def initializeSurgeryTypes(surgeryType):
    overrideTable('surgeryType')

    for typeID in range(1, surgeryType + 1):
        sql = "INSERT INTO SurgeryType (ID, Name, Category, AnatomicalLocation, SpecialNeeds) VALUES (%s, %s, %s, %s, %s)"
        val = (typeID,
               f'Type Name #{typeID}',
               random.choice(['H', '0']),
               f'Location #{typeID}',
               f'Special needs #{typeID}'
               )
        cursor.execute(sql, val)

    print(f'{surgeryType} surgery types added successfully!')
    # Commit the transaction
    db.commit()

def initializeSurgerySkills(surgerySkill):
    overrideTable('SurgerySkill')
    for skillID in range(1, surgerySkill + 1):
        cursor.execute(f"INSERT INTO SurgerySkill (ID, Description) VALUES ({skillID}, 'Description of skill {skillID}')")

    print(f'{surgerySkill} surgery skills added successfully!')
    # Commit the transaction
    db.commit()

def initializeSurgeryTypeSkills(surgeryTypeSkills):
    overrideTable('SurgeryTypeSkill')

    # Create a list of type IDs
    cursor.execute("SELECT ID FROM SurgeryType")
    typeIDs = [row[0] for row in cursor.fetchall()]

    # Create a list of skill IDs
    cursor.execute("SELECT ID FROM SurgerySkill")
    skillIDs = [row[0] for row in cursor.fetchall()]

    # Create unique pairs
    pairs = []
    for typeID in typeIDs:
        for skillID in skillIDs:
            pairs.append((typeID, skillID))

    for typeSkill in range(1, surgeryTypeSkills):
        if pairs:
            pair = random.choice(pairs)
            pairs.remove(pair)
            cursor.execute(f"INSERT INTO SurgeryTypeSkill (SurgeryTypeID, SkillID) VALUES ({pair[0]}, {pair[1]})")
        else:
            print("Could not add all requested surgery type skills. Ensure there are enough combinations of typeID and typeSkill")

    print(f'{surgeryTypeSkills} surgery type skills added successfully!')
    # Commit the transaction
    db.commit()

def initializeSurgeries(surgeries):
    overrideTable('Surgery')

    # Create a list of surgery types
    cursor.execute("SELECT ID FROM SurgeryType")
    typeIDs = [row[0] for row in cursor.fetchall()]

    # Create a list of surgeons
    cursor.execute("SELECT ID FROM Surgeon")
    surgeonIDs = [row[0] for row in cursor.fetchall()]

    # Create a list of patients
    cursor.execute("SELECT ID FROM Patient")
    patientIDs = [row[0] for row in cursor.fetchall()]

    # Create unique trios
    trios = []
    for typeID in typeIDs:
        for surgeonID in surgeonIDs:
            for patientID in patientIDs:
                trios.append((typeID, surgeonID, patientID))

    for surgery in range(1, surgeries):
        if trios:
            trio = random.choice(trios)
            trios.remove(trio)
            sql = "INSERT INTO Surgery (SurgeryTypeID, SurgeonID, PatientID, OperationTheatreNumber, SurgeryDate) VALUES (%s, %s, %s, %s, %s)"
            val = (trio[0],
                   trio[1],
                   trio[2],
                   f'OR {surgery}',
                   randomDate(datetime.now(), datetime.now() + timedelta(days=30)),
                   )
            cursor.execute(sql, val)
        else:
            print("Could not add all requested surgeries. Ensure there are enough combinations of typeID, surgeonID, and patientID")

    print(f'{surgeries} surgeries added successfully!')
    # Commit the transaction
    db.commit()

def initializeRelationships(rel1, rel2, n):
    bFound = False
    if rel1 == 'patient' or rel2 == 'patient':
        if rel1 == 'nurse' or rel2 == 'nurse':
            bFound = True
            table = 'PatientAssignedNurse'
            sql = f"INSERT INTO {table} (NurseID, PatientID, Shift, DateOfCare) VALUES (%s, %s, %s, %s)"
        if rel1 == 'physician' or rel2 == 'physician':
            bFound = True
            table = 'PatientAssignedPhysician'
            sql = f"INSERT INTO {table} (PhysicianID, PatientID) VALUES (%s, %s)"

    if(not bFound):
        print("Could not complete request. Check the spelling of your parameters.")
        return

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

    print(f"{n} relationships between {rel1} and {rel2} added successfully!")
    # Commit the transaction
    db.commit()

def defaultRows():
    print('Creating tables, please do not interrupt the process.')
    initializeBedsTable(700)
    initializePatients(623)
    initializeEmployees(721)
    initializeNurses(200)
    initializeRelationships('patient', 'nurse', 73)
    initializePhysicians(130)
    initializeRelationships('patient', 'physician', 95)
    initializeMedicalData(423)
    initializeSurgeons(20)
    initializeSurgerySkills(14)
    initializeSurgeryTypes(10)
    initializeSurgeryTypeSkills(10)
    initializeSurgeries(15)

if __name__ == "__main__":
    # Parse command-line arguments
    parser = argparse.ArgumentParser(description='Initialize several tables within the NJIT_DataMGMT database.')
    parser.add_argument('-beds', type=int, help='the number of beds to insert')
    parser.add_argument('-patients', type=int, help='the number of patients to insert')
    parser.add_argument('-employees', type=int, help='the number of employees to insert')
    parser.add_argument('-nurses', type=int, help='the number of nurses to insert')
    parser.add_argument('-physicians', type=int, help='the number of physicians to insert')
    parser.add_argument('-relationship', nargs=3, metavar=('rel1', 'rel2', 'n'), help='takes 3 arguments: rel1 and rel2 for the relationships and n for the amount')
    parser.add_argument('-medicaldata', type=int, help='the amount of medical information to insert for random patients')
    parser.add_argument('-surgeons', type=int, help='the number of surgeons to insert')
    parser.add_argument('-surgeryskills', type=int, help='the number of surgery skills to insert')
    parser.add_argument('-surgerytypes', type=int, help='the number of surgery types to insert')
    parser.add_argument('-surgerytypeskills', type=int, help='the number of surgery type skills to insert')
    parser.add_argument('-surgeries', type=int, help='the number of surgeries to insert')
    parser.add_argument('-default', action='store_true', help='initialize as many rows in the database as this script allows')
    args = parser.parse_args()

    # Initialize the rows
    if args.default:
        defaultRows()
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
    if args.medicaldata is not None:
        initializeMedicalData(args.medicaldata)
    if args.surgeons is not None:
        initializeSurgeons(args.surgeons)
    if args.surgeryskills is not None:
        initializeSurgerySkills(args.surgeryskills)
    if args.surgerytypes is not None:
        initializeSurgeryTypes(args.surgerytypes)
    if args.surgerytypeskills is not None:
        initializeSurgeryTypeSkills(args.surgerytypeskills)
    if args.surgeries is not None:
        initializeSurgeries(args.surgeries)
