import argparse
from math import floor
import mysql.connector

def initializeBedsTable(beds):
    # Configure MySQL connection
    db = mysql.connector.connect(
        host="localhost",
        user="root",
        password="root",
        database="njit_datamgmt"
    )

    # Create a cursor
    cursor = db.cursor()

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

if __name__ == "__main__":
    # Parse command-line arguments
    parser = argparse.ArgumentParser(description='Initialize the BedLocation table with a specified number of beds.')
    parser.add_argument('-beds', type=int, help='the number of beds to insert')

    args = parser.parse_args()

    # Initialize the rows
    if args.beds is not None:
        initializeBedsTable(args.beds)
