CREATE TABLE ClinicPersonnel (
    EmployeeID INT PRIMARY KEY,
    LastName VARCHAR(50),
    FirstName VARCHAR(50),
    Gender CHAR(1),
    Address VARCHAR(100),
    Telephone VARCHAR(20),
    EmploymentNumber VARCHAR(10) UNIQUE,
    Position VARCHAR(50),
    Salary DECIMAL(10, 2),
    Specialty VARCHAR(50),  -- For physicians
    ContractType VARCHAR(50),  -- For surgeons
    ContractLength INT,  -- For surgeons
    NurseGrade CHAR(1),  -- For nurses
    YearsOfExperience INT  -- For nurses
);

CREATE TABLE Patients (
    PatientID INT PRIMARY KEY,
    SSN VARCHAR(11) UNIQUE,
    LastName VARCHAR(50),
    FirstName VARCHAR(50),
    Gender CHAR(1),
    DateOfBirth DATE,
    Address VARCHAR(100),
    Telephone VARCHAR(20),
    BloodType VARCHAR(5),
    CholesterolHDL DECIMAL(5, 2),
    CholesterolLDL DECIMAL(5, 2),
    Triglycerides DECIMAL(5, 2),
    BloodSugar DECIMAL(5, 2),
    Allergies VARCHAR(200)
);

CREATE TABLE SurgeonSkills (
    SkillCode INT PRIMARY KEY,
    Description VARCHAR(100) UNIQUE
);

CREATE TABLE NurseSkills (
    SkillCode INT PRIMARY KEY,
    Description VARCHAR(100) UNIQUE
);

CREATE TABLE SurgeryTypes (
    SurgeryCode INT PRIMARY KEY,
    Name VARCHAR(100),
    Category CHAR(1),
    AnatomicalLocation VARCHAR(50),
    SpecialNeeds VARCHAR(100)
);

CREATE TABLE SurgerySkills (
    SurgeryCode INT,
    SkillCode INT,
    PRIMARY KEY (SurgeryCode, SkillCode),
    FOREIGN KEY (SurgeryCode) REFERENCES SurgeryTypes (SurgeryCode),
    FOREIGN KEY (SkillCode) REFERENCES SurgeonSkills (SkillCode)
);

CREATE TABLE SurgerySchedule (
    ScheduleID INT PRIMARY KEY,
    SurgeryCode INT,
    SurgeonEmployeeID INT,
    PatientID INT,
    OperationTheatre INT,
    SurgeryDate DATETIME,
    FOREIGN KEY (SurgeryCode) REFERENCES SurgeryTypes (SurgeryCode),
    FOREIGN KEY (SurgeonEmployeeID) REFERENCES ClinicPersonnel (EmployeeID),
    FOREIGN KEY (PatientID) REFERENCES Patients (PatientID)
);

CREATE TABLE Illnesses (
    IllnessCode INT PRIMARY KEY,
    Description VARCHAR(100) UNIQUE
);

CREATE TABLE Medications (
    MedicationCode INT PRIMARY KEY,
    Name VARCHAR(100),
    QuantityOnHand INT,
    QuantityOnOrder INT,
    UnitCost DECIMAL(8, 2),
    YearToDateUsage INT
);

CREATE TABLE MedicationInteractions (
    InteractionID INT PRIMARY KEY,
    MedicationCode1 INT,
    MedicationCode2 INT,
    Severity CHAR(1),
    FOREIGN KEY (MedicationCode1) REFERENCES Medications (MedicationCode),
    FOREIGN KEY (MedicationCode2) REFERENCES Medications (MedicationCode)
);

CREATE TABLE OwnershipInterests (
    CorporationName VARCHAR(100) PRIMARY KEY,
    Headquarters VARCHAR(100),
    PercentageOwnership DECIMAL(5, 2)
);

CREATE TABLE PatientDoctorRelationship (
    PatientID INT,
    PhysicianEmployeeID INT,
    PRIMARY KEY (PatientID, PhysicianEmployeeID),
    FOREIGN KEY (PatientID) REFERENCES Patients (PatientID),
    FOREIGN KEY (PhysicianEmployeeID) REFERENCES ClinicPersonnel (EmployeeID)
);

CREATE TABLE PatientIllness (
    PatientID INT,
    IllnessCode INT,
    PRIMARY KEY (PatientID, IllnessCode),
    FOREIGN KEY (PatientID) REFERENCES Patients (PatientID),
    FOREIGN KEY (IllnessCode) REFERENCES Illnesses (IllnessCode)
);

CREATE TABLE Prescriptions (
    PrescriptionID INT PRIMARY KEY,
    MedicationCode INT,
    PhysicianEmployeeID INT,
    PatientID INT,
    Dosage VARCHAR(50),
    Frequency VARCHAR(50),
    PrescriptionDate DATETIME,
    FOREIGN KEY (MedicationCode) REFERENCES Medications (MedicationCode),
    FOREIGN KEY (PhysicianEmployeeID) REFERENCES ClinicPersonnel (EmployeeID),
    FOREIGN KEY (PatientID) REFERENCES Patients (PatientID)
);
