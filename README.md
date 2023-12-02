# NJIT_DataManagementProject
Term project for CS 631 851 at NJIT. Supplementary information can be found [here](https://docs.google.com/document/d/1sM_TkhyeoWbIAFcrFBpwjBQ53cSiwFLRUVbyaL_cA-M/edit?usp=sharing).

## Disclaimer
This project is intended to show basic communication between a database and a website, as well as a comprehensive database setup. It is not created with security or optimization in mind as that is outside the scope of the project.

## Dependencies
* Flask
* Python
* MySQL Server

## How to run
1. Initalize DB
   * Do not create a database, simply run the server and connect to it then follow the next steps
   * Run initalizeDB.sql or copy and paste their contents in your preferred configurator (MySQL Command Line Client, MySQL Workbench, etc.)
3. Open your IDE
4. In the terminal, navigate to the working directory, ensure pip is up to date and run the following commands:
   * "pip install Flask"
   * "git clone https://github.com/xaviergaray/NJIT_DataManagementProject.git"
   * "python NJIT_DataManagementProject\scripts\initializeRows.py -default" (*Here you can add -h to see specific configuration options*)
   * "python NJIT_DataManagementProject\docs\main.py"
5. On your browser, go to http://127.0.0.1:5000
