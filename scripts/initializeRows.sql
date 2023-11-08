use njit_datamgmt;
INSERT INTO ClinicPersonnel (EmployeeID, LastName, FirstName, Gender, Address, Telephone, EmploymentNumber, Position, Salary, Specialty, ContractType, ContractLength, NurseGrade, YearsOfExperience)
VALUES
    (1, 'Smith', 'John', 'M', '123 Main St', '555-1234', 'EMP001', 'Physician', 120000, 'Cardiologist', NULL, NULL, NULL, NULL),
    (2, 'Johnson', 'Mary', 'F', '456 Elm St', '555-5678', 'EMP002', 'Surgeon', NULL, 'Orthopedic Surgeon', 'Contract', 2, NULL, NULL),
    (3, 'Brown', 'David', 'M', '789 Oak St', '555-9876', 'EMP003', 'Nurse', 60000, NULL, NULL, NULL, 'RN', 5);

INSERT INTO SurgeonSkills (SkillCode, Description)
VALUES
    (1, 'Orthopedic Surgery'),
    (2, 'Cardiothoracic Surgery'),
    (3, 'Neurological Surgery');

INSERT INTO SurgeryTypes (SurgeryCode, Name, Category, AnatomicalLocation, SpecialNeeds)
VALUES
    (1, 'Knee Replacement', 'H', 'Knee', 'Orthopedic'),
    (2, 'Heart Bypass Surgery', 'H', 'Heart', 'Cardiothoracic'),
    (3, 'Brain Surgery', 'H', 'Brain', 'Neurological');
    
INSERT INTO SurgerySkills (SurgeryCode, SkillCode)
VALUES
    (1, 1),  -- Orthopedic Surgery
    (2, 2),  -- Cardiothoracic Surgery
    (2, 3);  -- Neurological Surgery
    
INSERT INTO Patients (PatientID, SSN, LastName, FirstName, Gender, DateOfBirth, Address, Telephone, BloodType, CholesterolHDL, CholesterolLDL, Triglycerides, BloodSugar, Allergies)
VALUES
    (101, '123-45-6789', 'Wilson', 'Alice', 'F', '1980-05-25', '567 Pine St', '555-1111', 'A+', 45.5, 120.3, 75.8, 85.2, 'Penicillin'),
    (102, '234-56-7890', 'Garcia', 'Carlos', 'M', '1975-08-12', '789 Cedar St', '555-2222', 'O-', 38.2, 140.1, 68.7, 92.7, 'Latex'),
    (103, '345-67-8901', 'Lee', 'Sarah', 'F', '1990-03-15', '890 Oak St', '555-3333', 'B+', 50.0, 115.2, 85.5, 88.0, 'None');

INSERT INTO SurgerySchedule (ScheduleID, SurgeryCode, SurgeonEmployeeID, PatientID, OperationTheatre, SurgeryDate)
VALUES
    (1, 1, 2, 101, 'OR-1', '2023-11-15 10:00:00'),
    (2, 2, 2, 102, 'OR-2', '2023-11-16 11:30:00'),
    (3, 3, 2, 103, 'OR-3', '2023-11-18 09:15:00');

INSERT INTO Illnesses (IllnessCode, Description)
VALUES
    (1, 'Hypertension'),
    (2, 'Diabetes'),
    (3, 'Osteoarthritis');

INSERT INTO Medications (MedicationCode, Name, QuantityOnHand, QuantityOnOrder, UnitCost, YearToDateUsage)
VALUES
    (1, 'Lisinopril', 100, 50, 0.50, 1200),
    (2, 'Metformin', 75, 25, 0.60, 900),
    (3, 'Ibuprofen', 200, 100, 0.25, 3000);

INSERT INTO MedicationInteractions (InteractionID, MedicationCode1, MedicationCode2, Severity)
VALUES
    (1, 1, 2, 'M'),  -- Lisinopril and Metformin
    (2, 2, 3, 'L'),  -- Metformin and Ibuprofen
    (3, 1, 3, 'S');  -- Lisinopril and Ibuprofen

INSERT INTO OwnershipInterests (CorporationName, Headquarters, PercentageOwnership)
VALUES
    ('MedicalCorp1', 'New York', 60.0),
    ('MedicalCorp2', 'Chicago', 40.0);

INSERT INTO PatientDoctorRelationship (PatientID, PhysicianEmployeeID)
VALUES
    (101, 1),  -- Patient Alice with Physician John Smith
    (102, 1),  -- Patient Carlos with Physician John Smith
    (103, 1);  -- Patient Sarah with Physician John Smith

INSERT INTO PatientIllness (PatientID, IllnessCode)
VALUES
    (101, 1),  -- Patient Alice has Hypertension
    (102, 2),  -- Patient Carlos has Diabetes
    (103, 3),  -- Patient Sarah has Osteoarthritis
    (103, 1);  -- Patient Sarah also has Hypertension

INSERT INTO Prescriptions (PrescriptionID, MedicationCode, PhysicianEmployeeID, PatientID, Dosage, Frequency, PrescriptionDate)
VALUES
    (1, 1, 1, 101, '10mg once daily', 'Morning', '2023-11-05 09:30:00'),
    (2, 2, 1, 102, '500mg twice daily', 'Morning and Evening', '2023-11-06 11:15:00'),
    (3, 3, 1, 103, '200mg as needed', 'As needed', '2023-11-07 15:45:00');

INSERT INTO NurseSkills (SkillCode, Description)
VALUES
    (1, 'Cardiac Care'),
    (2, 'Surgical Nursing'),
    (3, 'Pediatric Care');