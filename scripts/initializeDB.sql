CREATE DATABASE NJIT_DATAMGMT;

USE NJIT_DATAMGMT;

-- "nursing unit, room number, and bed number"
-- "Nursing units a renumbered 1 through 7"
-- "rooms are located in either the Blue or Green wing"
-- "bed numbers in a room are labeled A or B"
CREATE TABLE BedLocation (
    ID INT PRIMARY KEY,
    NursingUnit INT CHECK (NursingUnit > 0 AND NursingUnit < 8) NOT NULL,
    Wing ENUM('Blue', 'Green') NOT NULL,
    RoomNumber INT NOT NULL,
    BedNumber ENUM('A', 'B') NOT NULL
);

-- "All clinic personnel have an employment number, name, gender (male or female), address and telephone number; with the exception of surgeons, all clinic personnel also have a salary (which can range from $25,000 to $300,000), but salaries of some can be missing."
-- "For both clinic personnel and patients, a Social Security number is collected."
CREATE TABLE Personnel (
    ID INT PRIMARY KEY,
    Name VARCHAR(100),
    Role VARCHAR(50),
    Salary DECIMAL(10, 2),
    IsOwner BOOLEAN,
    IsSurgeon BOOLEAN,
    EmploymentNumber INT,
    Gender CHAR(1),
    Address VARCHAR(255),
    TelephoneNumber VARCHAR(15),
    SocialSecurityNumber VARCHAR(11)
);

-- "For each physician, his or her specialty is captured whereas for each surgeon data pertaining to his or her specialty and contract are captured. Contract data for surgeons include the type of contract and the length of the contract (in years)."
CREATE TABLE Surgeons (
    ID INT PRIMARY KEY,
    Specialty VARCHAR(100),
    ContractType VARCHAR(50),
    ContractLength INT,
    FOREIGN KEY (ID) REFERENCES Personnel(ID)
);

-- "A surgery code is used to identify each specific type of surgery. In addition the name category, anatomical location, and special needs are also captured for each surgery type. There are two surgery categories: those that require hospitalization (category= H) and those than can be performed on an outpatient basis (category = 0)."
CREATE TABLE SurgeryTypes (
    ID INT PRIMARY KEY,
    Name VARCHAR(100),
    SurgeonID INT,
    Category CHAR(1),
    AnatomicalLocation VARCHAR(100),
    SpecialNeeds VARCHAR(255),
    FOREIGN KEY (SurgeonID) REFERENCES Surgeons(ID)
);

-- "A surgery skill is identified by its description and a unique skill code."
CREATE TABLE SurgerySkills (
    ID INT PRIMARY KEY,
    Name VARCHAR(100)
);

-- "A surgery type requires at least one but often many surgery skills are utilized in numerous surgery types."
CREATE TABLE SurgeryTypeSkills (
    SurgeryTypeID INT,
    SkillID INT,
    PRIMARY KEY (SurgeryTypeID, SkillID),
    FOREIGN KEY (SurgeryTypeID) REFERENCES SurgeryTypes(ID),
    FOREIGN KEY (SkillID) REFERENCES SurgerySkills(ID)
);

-- "Grade and years of experience represent the specific data requirement for nurses."
CREATE TABLE Nurses (
    ID INT PRIMARY KEY,
    SurgeryTypeID INT,
    Grade INT,
    YearsOfExperience INT,
    FOREIGN KEY (ID) REFERENCES Personnel(ID),
    FOREIGN KEY (SurgeryTypeID) REFERENCES SurgeryTypes(ID)
);

-- "Data for patients consists of personal data and medical data. Personal data includes patient number (the unique identifier of a patient), name, gender (male or female), date of birth, address, and telephone number. Medical data include the patient’s blood type, cholesterol (consisting of HDL, LDL, and triglyceride), blood sugar, and the code and name of all the patient’s allergies."
-- "For both clinic personnel and patients, a Social Security number is collected."
CREATE TABLE Patients (
    ID INT PRIMARY KEY,
    Name VARCHAR(100),
    Illness VARCHAR(255),
    Allergies VARCHAR(255),
    BedID INT,
    NurseID INT,
    PhysicianID INT,
    DateOfBirth DATE,
    BloodType CHAR(3),
    HDL DECIMAL(5, 2),
    LDL DECIMAL(5, 2),
    Triglycerides DECIMAL(5, 2),
    BloodSugar DECIMAL(5, 2),
    SocialSecurityNumber VARCHAR(11),
    AdmissionDate DATE,
    NursingUnit INT,
    FOREIGN KEY (NurseID) REFERENCES Nurses(ID),
    FOREIGN KEY (PhysicianID) REFERENCES Personnel(ID),
    FOREIGN KEY (BedID) REFERENCES BedLocation(ID)
);

-- "Since surgeons perform surgery on patients as needed, it is required that a surgery schedule keep track of the operation theatre where a surgeon performs a certain surgery type on a particular patient and when that surgery type is performed."
CREATE TABLE Surgeries (
    ID INT PRIMARY KEY,
    SurgeryTypeID INT,
    PatientID INT,
    OperationTheatreNumber INT,
    SurgeryDate DATE,
    FOREIGN KEY (SurgeryTypeID) REFERENCES SurgeryTypes(ID),
    FOREIGN KEY (PatientID) REFERENCES Patients(ID)
);

-- "Physicians prescribe medications to patients; thus it is necessary to capture which physician(s) prescribes what medication(s) to which patient(s) along with dosage and frequency."
CREATE TABLE Medications (
    ID INT PRIMARY KEY,
    Name VARCHAR(100),
    Dosage VARCHAR(50),
    Frequency VARCHAR(50),
    QuantityOnHand INT,
    QuantityOnOrder INT,
    UnitCost DECIMAL(10, 2),
    YearToDateUsage INT
);

-- "Physicians prescribe medications to patients; thus it is necessary to capture which physician(s) prescribes what medication(s) to which patient(s) along with dosage and frequency."
CREATE TABLE Prescriptions (
    ID INT PRIMARY KEY,
    MedicationID INT,
    PhysicianID INT,
    PatientID INT,
    FOREIGN KEY (MedicationID) REFERENCES Medications(ID),
    FOREIGN KEY (PhysicianID) REFERENCES Personnel(ID),
    FOREIGN KEY (PatientID) REFERENCES Patients(ID)
);

-- "As a medicine may interact with several other medicines, the severity of such interaction must be recorded in the system. Possible interactions include S = Severe interaction, M = Moderate interaction, L = Little interaction, and N = No interaction."
CREATE TABLE MedicationInteractions (
    Medication1ID INT,
    Medication2ID INT,
    Severity CHAR(1),
    PRIMARY KEY (Medication1ID, Medication2ID),
    FOREIGN KEY (Medication1ID) REFERENCES Medications(ID),
    FOREIGN KEY (Medication2ID) REFERENCES Medications(ID)
);

-- "For medical corporations with ownership interest in the clinic the corporation name and headquarters are obtained. Corporation name uniquely identifies a medical corporation. The percentage ownership of each clinic is also recorded."
CREATE TABLE MedicalCorporations (
    Name VARCHAR(100) PRIMARY KEY,
    Headquarters VARCHAR(255),
    OwnershipPercentage DECIMAL(5, 2)
);

-- "For each illness, a code and description are recorded."
CREATE TABLE Illnesses (
    Code INT PRIMARY KEY,
    Description VARCHAR(255)
);

-- "A patient may have several illnesses and several patients may have the same illness."
CREATE TABLE PatientIllnesses (
    PatientID INT,
    IllnessCode INT,
    PRIMARY KEY (PatientID, IllnessCode),
    FOREIGN KEY (PatientID) REFERENCES Patients(ID),
    FOREIGN KEY (IllnessCode) REFERENCES Illnesses(Code)
);

-- "A patient may be taking several medications, and a particular medication may be taken by several patients. However, in order for a patient to take a medicine the medicine must be prescribed to that patient."
CREATE TABLE PatientMedications (
    PatientID INT,
    MedicationID INT,
    PRIMARY KEY (PatientID, MedicationID),
    FOREIGN KEY (PatientID) REFERENCES Patients(ID),
    FOREIGN KEY (MedicationID) REFERENCES Medications(ID)
);
