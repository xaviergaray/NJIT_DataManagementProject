import argparse
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

    for i in range(1, beds + 1):
        # Determine the wing and bed number based on the ID
        wing = 'Blue' if i <= beds / 2 else 'Green'
        bed_number = 'A' if i % 2 == 1 else 'B'

        # Insert a row into the BedLocation table
        sql = "INSERT INTO BedLocation (ID, NursingUnit, Wing, RoomNumber, BedNumber) VALUES (%s, %s, %s, %s, %s)"
        val = (i, 1, wing, 100 + i, bed_number)
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
