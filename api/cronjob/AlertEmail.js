const {pool} = require("../databaseConn/database.js")
const {generateLabResultsAlert, generateNewPrescriptionAlarmAlert, structureReadingAlert} = require("../Controllers/SortAlerts.js")
const nodemailer = require('nodemailer')

let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
});

const getDoctorAlerts = async (diD) => {
    // const {doctor_id} = req.params;
    var finalPatients = [];
    var doctor_id = diD.toString();
    const getPatientsQuery = `SELECT * FROM doctor_patients WHERE doctor_id = '${doctor_id}'`;
    var patients = [];
   try {
    patients = await pool.query(getPatientsQuery);
    
   } catch (error) {

    console.log("Error in getting patients", error);
    return [];

    
   }
   patients.forEach((patient) => {
    finalPatients.push(patient.patient_id);
   });


    console.log("Final Patients", finalPatients);

    var alerts = [];
    for (var i = 0; i < finalPatients.length; i++){
        // get previous day's alerts
        const previousDate = new Date() - 1;
        console.log("Previous Date", previousDate);
        const patientAlerts = await pool.query(`SELECT * FROM alerts WHERE patientId = '${finalPatients[i]}' AND date = CURDATE() - INTERVAL 1 DAY`);
        for (var j = 0; j < patientAlerts.length; j++){
            alerts.push(patientAlerts[j]);
        }
    }



    var reading = []

    for (var i = 0;i<finalPatients.length;i++){
        const readingAlerts = await pool.query(`SELECT * FROM readingalerts WHERE patientId = '${finalPatients[i]}' AND date = CURDATE() - INTERVAL 1 DAY`);
        for (var j = 0; j < readingAlerts.length; j++){
            reading.push(readingAlerts[j]);
        }
    }

    var finalAlerts = [];

    for (var i = 0; i < alerts.length; i++){
        if (alerts[i].category === "New Prescription Alarm"){
            finalAlerts.push(await generateNewPrescriptionAlarmAlert(alerts[i]));
        }
    }

    for (var i = 0; i < reading.length; i++){
        finalAlerts.push(await structureReadingAlert(reading[i]));
    }

    console.log(finalAlerts);

    return finalAlerts;


}


const generateEmail = async (doctor_id) =>{
    const alerts = await getDoctorAlerts(doctor_id);
    console.log("alerts", alerts)
    // group alerts by patient
    const alertsByPatient = {};
    alerts.forEach((alert) => {
        if (!alertsByPatient[alert.patientId]){
            alertsByPatient[alert.patientId] = [];
        }
        alertsByPatient[alert.patientId].push(alert);
    });
    console.log("alertsByPatient", alertsByPatient);
    const getEmailQuery = `SELECT email FROM doctors WHERE id = '${doctor_id}'`;
    const email = await pool.query(getEmailQuery);
    const emailToSend = email[0].email;

    // const emailContent = `
    //     <!DOCTYPE html>
    //     <html lang="en">
    //     <head>
    //         <meta charset="UTF-8">
    //         <meta http-equiv="X-UA-Compatible" content="IE=edge">
    //         <meta name="viewport" content="width=device-width, initial-scale=1.0">
    //         <title>Today's Alerts</title>
    //         <style>
    //             /* Add your CSS styles here */
    //             body {
    //                 font-family: Arial, sans-serif;
    //                 background-color: #f4f4f4;
    //                 padding: 20px;
    //             }
    //             h1 {
    //                 color: #333;
    //             }
    //             .alert {
    //                 background-color: #fff;
    //                 border: 1px solid #ccc;
    //                 border-radius: 5px;
    //                 padding: 10px;
    //                 margin-bottom: 10px;
    //             }
    //         </style>
    //     </head>
    //     <body>
    //         <h1>Today's Alerts</h1>
    //         ${alerts.map((alert) => {
    //             return `<div class="alert">
    //                         <p><strong>Patient:</strong> ${alert.name}</p>
    //                         <p><strong>Alert:</strong> ${alert.type}</p>
    //                         ${alert.category ? `<p><strong>Category:</strong> ${alert.category}</p>` : ""}
    //                         <p><strong>Date:</strong> ${alert.date}</p>
    //                     </div>`
    //         }).join("")}
    //     </body>
    //     </html>
    // `;

    let emailContent2 = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Today's Alerts</title>
        <style>
            /* Add your CSS styles here */
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                padding: 20px;
            }
            h1 {
                color: #333;
            }
            .alert {
                background-color: #fff;
                border: 1px solid #ccc;
                border-radius: 5px;
                padding: 10px;
                margin-bottom: 10px;
            }
        </style>
    </head>
    <body>
        <h1>Today's Alerts</h1>
`;

// Iterate over alerts grouped by patient
for (const patientId in alertsByPatient) {
    if (alertsByPatient.hasOwnProperty(patientId)) {
        // Fetch patient name
        const getPatientNameQuery = `SELECT name FROM patients WHERE id = '${patientId}'`;
        const patientNameResult = await pool.query(getPatientNameQuery);
        const patientName = patientNameResult[0].name;

        // Add patient name as heading
        emailContent2 += `<h2>${patientName}</h2>`;

        // Add alerts for the patient
        alertsByPatient[patientId].forEach((alert) => {
            emailContent2 += `
                <div class="alert">
                    <p><strong>Alert:</strong> ${alert.type}</p>
                    ${alert.category ? `<p><strong>Category:</strong> ${alert.category}</p>` : ""}
                    <p><strong>Date:</strong> ${alert.date}</p>
                </div>
            `;
        });
    }
}

emailContent2 += `
    </body>
    </html>
`;

    let info = await transporter.sendMail({
        from: process.env.MAIL_USER,
        to: emailToSend,
        subject: "Today's Alerts",
        html: emailContent2
    })

    return true;
}


const sendEmails = async () => {
    console.log("Sending Emails");
    const getDoctorsQuery = `SELECT * FROM doctors`;
    const doctors = await pool.query(getDoctorsQuery);
    for (var i = 0; i < doctors.length; i++){
        if (doctors[i].email_notification === 'yes'){
        await generateEmail(doctors[i].id);
        }
    }
    console.log("Emails Sent");
}

module.exports = {sendEmails}
