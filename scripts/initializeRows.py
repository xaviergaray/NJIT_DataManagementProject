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
                   f"({random.randint(100, 999)}){random.randint(10, 99)}{random.randint(1000, 9999)}",
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


if __name__ == "__main__":
    # Parse command-line arguments
    parser = argparse.ArgumentParser(description='Initialize the BedLocation, Patients, Personnel, Surgeons, SurgeryTypes, and Nurses tables with a specified number of beds, patients, personnel, surgeons, surgery types, and nurses.')
    parser.add_argument('-beds', type=int, help='the number of beds to insert')
    parser.add_argument('-patients', type=int, help='the number of patients to insert')
    args = parser.parse_args()

    # Initialize the rows
    if args.beds is not None:
        initializeBedsTable(args.beds)
    if args.patients is not None:
        initializePatients(args.patients)
