var employees;
var editfield;
var editEmployeeID;
var originalValues;
var ellipsesPressed;

window.onload = async function() {
    // Initialize DB variables
    let response = await fetch('/get-employees');
    employees = await response.json();

    // Populate Table
    PopulateTable();

    // Get the dropdown element
    let dropdown = document.getElementById('rolefilter');

    // Create a set to store unique roles
    let roles = new Set();

    // Loop through the employees
    for (let i = 0; i < employees.length; i++) {
        // Add the role to the set
        roles.add(employees[i]['Role']);
    }

    // Loop through the unique roles
    for (let role of roles) {
        // Create a new option element
        let option = document.createElement('option');
        if (role === null) {
            option.value = 'No Assigned Role';
            option.text = 'No Assigned Role';
        } else {
            option.value = role;
            option.text = role;
        }

        // Add the option to the dropdown
        dropdown.add(option);
    }

    // Role Filter event listener
    var roleFilter = document.getElementById('rolefilter');
    roleFilter.addEventListener('change', function() {
        PopulateTable();
    });

    // Shift Filter event listener
    var shiftFilter = document.getElementById('shiftfilter');
    shiftFilter.addEventListener('change', function() {
        PopulateTable();
    });

    // Add event listeners to the sort buttons
    var sortButtons = document.querySelectorAll('.sort-btn');
    sortButtons.forEach(function(btn) {
        btn.ascending = true;  // Variable to toggle the sort order

        btn.addEventListener('click', function() {
            var sortField = this.dataset.sort;

            // If this is the first click, set ascending to true
            if (btn.ascending === true) {
                btn.ascending = false;
            } else {
                btn.ascending = true;
            }

            // Sort the data
            employees.sort(function(a, b) {
                if (a[sortField] !== b[sortField]) {
                    return btn.ascending ? (a[sortField] < b[sortField] ? -1 : 1) : (a[sortField] > b[sortField] ? -1 : 1);
                }

                // If the fields match, sub-sort by 'ID'
                return a.ID - b.ID;
            });

            // Change the icon
            var icon = this.querySelector('i');
            if (btn.ascending) {
                icon.className = 'fas fa-sort-up';
            } else {
                icon.className = 'fas fa-sort-down';
            }

            // Reset the icons and sort order of the other columns
            var otherButtons = document.querySelectorAll('.sort-btn:not([data-sort="' + sortField + '"])');
            otherButtons.forEach(function(otherBtn) {
                var otherIcon = otherBtn.querySelector('i');
                otherIcon.className = 'fas fa-sort';
                otherBtn.ascending = true;  // Reset the sort order
            });

            // Repopulate the table with the sorted data
            PopulateTable();
        });
    });
    var modal = document.getElementById("myModal");
    var removeBtn = document.getElementById('removeButton');
    var btn = document.getElementById("add-employee-btn");
    var span = document.getElementsByClassName("close")[0];

    btn.onclick = function() {
      modal.style.display = "block";
      ellipsesPressed = false;
      resetModalValues();
    }

    span.onclick = function() {
      modal.style.display = "none";
      removeBtn.style.display = 'none'
    }

    window.onclick = function(event) {
      if (event.target == modal) {
        modal.style.display = "none";
        removeBtn.style.display = 'none'
      }
    }

    removeBtn.addEventListener('click', function() {
        fetch('/remove-employee', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                employeeID: editEmployeeID,
            })
        }).then(function(response) {
            if (response.ok) {
                return response.text();
            } else {
                throw new Error('Error: ' + response.statusText);
            }
        })
        .then(function(text) {
            alert('Success: ' + '\n\n' + text);
            editfield = [];

            // Fetch the updated list of employees from the server
            fetch('/get-employees')
            .then(response => response.json())
            .then(updatedEmployees => {
                employees = updatedEmployees;
            });
        })
        .catch(function(error) {
            alert('There was an error: ' + error.message);
        });
    });

    document.getElementById('EmployeeForm').addEventListener('submit', function(event) {
        event.preventDefault();

        // Get all the fields
        var name = document.getElementById('Name').value;
        var role = document.getElementById('Role').value;
        var contact = document.getElementById('contact').value;
        var gender = document.getElementById('gender').value;
        var shift = document.getElementById('Shift').value;
        var address = document.getElementById('address').value;
        var salary = document.getElementById('Salary').value;
        var ssn = document.getElementById('ssn').value;

        if (shift === '') {
            shift = null;
        }

        if (role === '') {
            role = "No Assigned Role";
        }

        // Determine which fields were changed
        var editfield = [];
        if (name !== originalValues.Name) editfield.push('Name');
        if (role !== originalValues.Role) editfield.push('Role');
        if (contact !== originalValues.TelephoneNumber) editfield.push('TelephoneNumber');
        if (gender !== originalValues.Gender) editfield.push('Gender');
        if (shift !== originalValues.Shift) editfield.push('Shift');
        if (address !== originalValues.Address) editfield.push('Address');
        if (salary !== originalValues.Salary) editfield.push('Salary');
        if (ssn !== originalValues.SocialSecurityNumber) editfield.push('SocialSecurityNumber');

        var formData = new FormData(this);
        // Create a new FormData object from the form
        if (ellipsesPressed) {
            if (editfield.length === 0) {
                console.log('nochange');
                return;
            }
            formData.append('id', editEmployeeID);
        }
        formData.append('name', name);
        formData.append('role', role);
        formData.append('contact', contact);
        formData.append('gender', gender);
        formData.append('shift', shift);
        formData.append('address', address);
        formData.append('salary', salary);
        formData.append('ssn', ssn);
        formData.append('editfield', JSON.stringify(editfield));  // Convert editfield to JSON string
        // Send the form data to the server using an AJAX request
        fetch('/set-employee', {
            method: 'POST',
            body: formData
        })
        .then(function(response) {
            if (response.ok) {
                return response.text();
            } else {
                throw new Error('Error: ' + response.statusText);
            }
        })
        .then(function(text) {
            alert('Success: ' + '\n\n' + text);
            editfield = [];

            // Fetch the updated list of employees from the server
            fetch('/get-employees')
            .then(response => response.json())
            .then(updatedEmployees => {
                employees = updatedEmployees;
            });
        })
        .catch(function(error) {
            alert('There was an error: ' + error.message);
        });

        // Close the modal
        document.getElementById('myModal').style.display = 'none';
        resetModalValues();
    });
}

PopulateTable = async function() {
    // Clear the table first
    databaseItems.querySelector('tbody').innerHTML = '';

    // For each employee
    for (let i = 0; i < employees.length; i++) {
        let employee = employees[i];
        if (!employee.Role) {
            employee.Role = 'No Assigned Role';
        }

        // Filter the data based on the selected role
        var roleFilter = document.getElementById('rolefilter');
        if (roleFilter.value != employee.Role && roleFilter.value != 'all') {
            continue;
        }

        // Filter the data based on the selected shift
        var shiftFilter = document.getElementById('shiftfilter');
        if (shiftFilter.value != employee.Shift && shiftFilter.value != 'all') {
            continue;
        }

        var row = document.createElement('tr');

        // Style the row based on whether its index is even or odd
        if (i  % 2 === 0) {
            row.style.backgroundColor = '#D3D3D3';
        } else {
            row.style.backgroundColor = '#808080';
        }

        var idCell = document.createElement('td');
        idCell.textContent = employee.ID;
        row.appendChild(idCell);

        var nameCell = document.createElement('td');
        nameCell.textContent = employee.Name;
        row.appendChild(nameCell);

        var roleCell = document.createElement('td');
        roleCell.textContent = employee.Role;
        row.appendChild(roleCell);

        var phoneNumberCell = document.createElement('td');
        phoneNumberCell.textContent = employee.TelephoneNumber;
        row.appendChild(phoneNumberCell);

        var shiftCell = document.createElement('td');
        if (employee.Shift == null) {
            shiftCell.textContent = 'No Assigned Shift';
        } else {
            shiftCell.textContent = employee.Shift;
        }
        row.appendChild(shiftCell);

        // Ellipsis button
        var ellipsisCell = document.createElement('td');
        var ellipsisButton = document.createElement('button');
        ellipsisButton.textContent = '...';
        ellipsisButton.style.backgroundColor = '#007BFF';
        ellipsisButton.style.color = 'white';
        ellipsisButton.style.border = 'none';
        ellipsisButton.style.padding = '5px 10px';
        ellipsisButton.style.borderRadius = '5px';
        ellipsisButton.style.cursor = 'pointer';
        ellipsisButton.addEventListener('click', function() {
            ellipsesPressed = true;
            editEmployeeID = employee.ID;
            // Store the original employee details
            originalValues = {...employee};

            // Display the modal and set the form fields with the employee's details
            document.getElementById('myModal').style.display = 'block';
            document.getElementById('Name').value = employee.Name;
            document.getElementById('Role').value = employee.Role;
            document.getElementById('contact').value = employee.TelephoneNumber;
            document.getElementById('gender').value = employee.Gender;
            document.getElementById('Shift').value = employee.Shift;
            document.getElementById('address').value = employee.Address;
            document.getElementById('Salary').value = employee.Salary;
            document.getElementById('ssn').value = employee.SocialSecurityNumber;

            document.getElementById('removeButton').style.display = 'block';
        });

        ellipsisCell.appendChild(ellipsisButton);
        row.appendChild(ellipsisCell);


        databaseItems.querySelector('tbody').appendChild(row);
    }
}

resetModalValues = function() {
    // Reset all the fields in the form
    document.getElementById('Name').value = '';
    document.getElementById('Role').value = '';
    document.getElementById('contact').value = '';
    document.getElementById('gender').value = '';
    document.getElementById('Shift').value = '';
    document.getElementById('address').value = '';
    document.getElementById('Salary').value = '';
    document.getElementById('ssn').value = '';

    originalValues = [];
}