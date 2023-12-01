CREATE DATABASE NJIT_DATAMGMT;

USE NJIT_DATAMGMT;

-- "A surgery code is used to identify each specific type of surgery. In addition the name category, anatomical location, and special needs are also captured for each surgery type. There are two surgery categories: those that require hospitalization (category= H) and those than can be performed on an outpatient basis (category = 0)."
CREATE TABLE SurgeryType (
    ID INT PRIMARY KEY,
    Name VARCHAR(100),
    Category ENUM('H', '0'),
    AnatomicalLocation VARCHAR(100),
    SpecialNeeds VARCHAR(255)
);

-- "A surgery skill is identified by its description and a unique skill code."
CREATE TABLE SurgerySkill (
    ID INT PRIMARY KEY,
    Description VARCHAR(100)
);

-- "A surgery type requires at least one but often many surgery skills are utilized in numerous surgery types."
-- Creates many to many relationship between surgery skills and type
CREATE TABLE SurgeryTypeSkill (
    SurgeryTypeID INT,
    SkillID INT,
    PRIMARY KEY (SurgeryTypeID, SkillID),
    FOREIGN KEY (SurgeryTypeID) REFERENCES SurgeryType(ID),
    FOREIGN KEY (SkillID) REFERENCES SurgerySkill(ID)
);

-- "All clinic personnel have an employment number, name, gender (male or female), address and telephone number; with the exception of surgeons, all clinic personnel also have a salary (which can range from $25,000 to $300,000), but salaries of some can be missing."
-- "For both clinic personnel and patients, a Social Security number is collected."
CREATE TABLE Employee (
    ID INT PRIMARY KEY,
    Name VARCHAR(100),
    Gender ENUM('M', 'F'),
    Address VARCHAR(255),
    TelephoneNumber VARCHAR(15),
    Role VARCHAR(50),
    Salary DECIMAL(10, 2),
    SocialSecurityNumber VARCHAR(11)
);

-- "Grade and years of experience represent the specific data requirement for nurses."
CREATE TABLE Nurse (
    ID INT PRIMARY KEY,
    SurgeryTypeID INT,
    Grade INT,
    YearsOfExperience INT,
    FOREIGN KEY (ID) REFERENCES Employee(ID),
    FOREIGN KEY (SurgeryTypeID) REFERENCES SurgeryType(ID)
);

-- Creates many to many relationship between surgery skills and nurses
CREATE TABLE NurseSurgerySkill (
    NurseID INT,
    SkillID INT,
    PRIMARY KEY (NurseID, SkillID),
    FOREIGN KEY (NurseID) REFERENCES Nurse(ID),
    FOREIGN KEY (SkillID) REFERENCES SurgerySkill(ID)
);

CREATE TABLE SupportStaff (
	ID INT PRIMARY KEY,
    EmpType VARCHAR(255),
    FOREIGN KEY (ID) REFERENCES Employee(ID)
);

-- "For each physician, his or her specialty is captured..."
-- "It is possible for a physician to have an ownership position in the clinic."
CREATE TABLE Physician (
	ID INT PRIMARY KEY,
	Specialty VARCHAR(100),
    FieldType VARCHAR(100),
    PercentOwnership INT,
    FOREIGN KEY (ID) REFERENCES Employee(ID)
);

 -- "...Whereas for each surgeon data pertaining to his or her specialty and contract are captured. Contract data for surgeons include the type of contract and the length of the contract (in years)."
CREATE TABLE Surgeon (
    ID INT PRIMARY KEY,
    Specialty INT,
    ContractType VARCHAR(50),
    ContractDuration INT,
    ContractAmount INT,
    FOREIGN KEY (ID) REFERENCES Physician(ID),
    FOREIGN KEY (Specialty) REFERENCES SurgeryType(ID)
);

-- "nursing unit, room number, and bed number"
-- "Nursing units a renumbered 1 through 7"
-- "rooms are located in either the Blue or Green wing"
-- "bed numbers in a room are labeled A or B"
CREATE TABLE ClinicBed (
    ID INT PRIMARY KEY,
    NursingUnit INT CHECK (NursingUnit > 0 AND NursingUnit < 8) NOT NULL,
    Wing ENUM('Blue', 'Green') NOT NULL,
    RoomNumber INT NOT NULL,
    BedLetter ENUM('A', 'B') NOT NULL
);

CREATE TABLE Allergy (
	ID INT PRIMARY KEY,
    Description VARCHAR(255)
);

CREATE TABLE Illness (
	ID INT PRIMARY KEY,
    Description VARCHAR(255)
);

-- "Data for patients consists of personal data and medical data. Personal data includes patient number (the unique identifier of a patient), name, gender (male or female), date of birth, address, and telephone number."
-- "For both clinic personnel and patients, a Social Security number is collected."
CREATE TABLE Patient (
    ID INT PRIMARY KEY,
    Name VARCHAR(100),
    Gender ENUM('M', 'F'),
    DOB DATE,
    Address VARCHAR(255),
    PhoneNumber VARCHAR(14),
    SocialSecurityNumber VARCHAR(11),
    BedID INT,
    AdmissionDate DATE,
    AdmissionDuration INT,
    PrimaryPhysicianID INT,
    FOREIGN KEY (PrimaryPhysicianID) REFERENCES Physician(ID),
    FOREIGN KEY (BedID) REFERENCES ClinicBed(ID)
);

-- Creates many to many relationship between patients and nurses
CREATE TABLE PatientAssignedNurse (
    NurseID INT,
    PatientID INT,
    Shift INT CHECK (Shift > 0 AND Shift < 4),
    DateOfCare DATE,
    PRIMARY KEY (NurseID, PatientID),
    FOREIGN KEY (NurseID) REFERENCES Nurse(ID),
    FOREIGN KEY (PatientID) REFERENCES Patient(ID)
);

-- Many to many relationship between Patients and Physicians
CREATE TABLE PatientAssignedPhysician (
	PatientID INT,
    PhysicianID INT,
    FOREIGN KEY (PatientID) REFERENCES Patient(ID),
    FOREIGN KEY (PhysicianID) REFERENCES Physician(ID),
    PRIMARY KEY (PatientID, PhysicianID)
);

-- Many to many relationship between Patients and Allergies
CREATE TABLE PatientAllergy (
    PatientID INT NOT NULL,
    AllergyID INT NOT NULL,
    PRIMARY KEY (PatientID, AllergyID),
    FOREIGN KEY (PatientID) REFERENCES Patient(ID),
    FOREIGN KEY (AllergyID) REFERENCES Allergy(ID)
);

CREATE TABLE Consultation (
    PatientID INT,
    PhysicianID INT,
    ConsultationType VARCHAR(255),
    DateOfConsult DATE,
    Notes VARCHAR(255),
    FOREIGN KEY (PatientID) REFERENCES Patient(ID),
    FOREIGN KEY (PhysicianID) REFERENCES Physician(ID),
    PRIMARY KEY (PatientID, PhysicianID, DateOfConsult)
);

CREATE TABLE Diagnosis (
    PatientID INT,
    PhysicianID INT,
    DateOfDiagnosis DATE,
    IllnessID INT,
    Comments VARCHAR(255),
    FOREIGN KEY(IllnessID) REFERENCES Illness(ID),
    FOREIGN KEY(PatientID, PhysicianID, DateOfDiagnosis) REFERENCES Consultation(PatientID, PhysicianID, DateOfConsult),
    PRIMARY KEY (PatientID, IllnessID, DateOfDiagnosis)
);

-- "Medical data include the patient’s blood type, cholesterol (consisting of HDL, LDL, and triglyceride), blood sugar, and the code and name of all the patient’s allergies."
CREATE TABLE MedicalData (
	PatientID INT PRIMARY KEY,
    CreationDate DATE,
	BloodType ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
	HDL DECIMAL(5, 2),
    LDL DECIMAL(5, 2),
    Triglycerides DECIMAL(5, 2),
    BloodSugar DECIMAL(5, 2),
    FOREIGN KEY (PatientID) REFERENCES Patient(ID)
);

-- "Since surgeons perform surgery on patients as needed, it is required that a surgery schedule keep track of the operation theatre where a surgeon performs a certain surgery type on a particular patient and when that surgery type is performed."
CREATE TABLE Surgery (
    SurgeryTypeID INT,
    SurgeonID INT,
    PatientID INT,
    OperationTheatreNumber VARCHAR(255),
    SurgeryDate DATE,
    FOREIGN KEY (SurgeryTypeID) REFERENCES SurgeryType(ID),
    FOREIGN KEY (SurgeonID) REFERENCES Surgeon(ID),
    FOREIGN KEY (PatientID) REFERENCES Patient(ID),
    PRIMARY KEY (SurgeryTypeID, SurgeonID, PatientID)
);

-- "For medical corporations with ownership interest in the clinic the corporation name and headquarters are obtained. Corporation name uniquely identifies a medical corporation. The percentage ownership of each clinic is also recorded."
CREATE TABLE Corporation (
    Name VARCHAR(100) PRIMARY KEY,
    Headquarters VARCHAR(255),
    PercentOwnership DECIMAL(5, 2)
);

-- "Physicians prescribe medications to patients; thus it is necessary to capture which physician(s) prescribes what medication(s) to which patient(s) along with dosage and frequency."
CREATE TABLE Medicine (
	ID INT PRIMARY KEY,
    UsageDescription VARCHAR(255),
    Quantity INT,
    UnitCost INT,
    Name VARCHAR(255),
    Manufacturer VARCHAR(100),
    FOREIGN KEY (Manufacturer) REFERENCES Corporation(Name)
);

-- "As a medicine may interact with several other medicines, the severity of such interaction must be recorded in the system. Possible interactions include S = Severe interaction, M = Moderate interaction, L = Little interaction, and N = No interaction."
CREATE TABLE MedicationInteractions (
    Medication1ID INT,
    Medication2ID INT,
    Severity ENUM('S', 'M', 'L', 'N'),
    PRIMARY KEY (Medication1ID, Medication2ID),
    FOREIGN KEY (Medication1ID) REFERENCES Medicine(ID),
    FOREIGN KEY (Medication2ID) REFERENCES Medicine(ID)
);

-- "Physicians prescribe medications to patients; thus it is necessary to capture which physician(s) prescribes what medication(s) to which patient(s) along with dosage and frequency."
CREATE TABLE Prescription (
	PatientID INT,
	PhysicianID INT,
    DateOfOrder DATE,
    MedicineID INT,
    Frequency INT,
    Duration INT,
    Dosage VARCHAR(255),
    FOREIGN KEY(PatientID, PhysicianID, DateOfOrder) REFERENCES Consultation(PatientID, PhysicianID, DateOfConsult),
    FOREIGN KEY (MedicineID) REFERENCES Medicine(ID),
    PRIMARY KEY (PatientID, PhysicianID, DateOfOrder, MedicineID)
);