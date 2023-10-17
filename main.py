from flask import Flask, render_template, request

app = Flask(__name__)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/add_patient', methods=['POST'])
def add_patient():
    # Get form data
    name = request.form.get('name')
    dob = request.form.get('dob')
    contact = request.form.get('contact')

    # Here, you would typically save this data to your database

    return "Patient added successfully!"


if __name__ == "__main__":
    app.run(debug=True)
