// const { da } = require("date-fns/locale");
const { pool } = require("../databaseConn/database.js")


const generateDoctorMessageToAdminAlert = async (obj) => {

    try {
        const chatId = obj.chatId;
        const getChatQuery = `SELECT * FROM chat WHERE id = '${chatId}'`;
        var chat = await pool.query(getChatQuery);
        chat = chat[0];
        if (!chat) return;
        try {
            const getDoctorNameQuery = `SELECT name FROM doctors WHERE email = '${chat.user2}'`;
            var doctorName = await pool.query(getDoctorNameQuery);
            doctorName = doctorName[0].name;
            var adminEmail = chat.user2;
            const getAdminIdQuery = `SELECT id FROM users WHERE email = '${adminEmail}'`;
            var adminId = await pool.query(getAdminIdQuery);
            adminId = adminId[0].id;

            const data = {
                id: obj.id,
                name: doctorName,
                type0: obj.type,
                type: `Message - ${obj.category.split("!")[1]}`,
                date: obj.date,
                redirect: `/adminChat/${chat.patientid}`,
                adminId: adminId,
                isOpened: obj.isOpened,
            };
            return data;

        } catch (error) {
            console.log(error)
            return null;
        }


    } catch (error) {
        console.log(error)
        return null;

    }
}

const generatePrescriptionDisapprovalAlert = async (obj) => {

    try {
        const alarmId = obj.alarmId;
        const getDoctorIdQuery = `SELECT doctorId FROM alarm WHERE id = '${alarmId}'`;
        if (!getDoctorIdQuery) return;
        let doctorId;
        try {
            doctorId = await pool.query(getDoctorIdQuery);
            doctorId = doctorId[0].doctorId

        } catch (error) {
            return null;

        }
        const patientID = obj.patientId;
        const doctorNameQuery = `SELECT name FROM doctors WHERE id = '${doctorId}'`;
        var doctorName = await pool.query(doctorNameQuery);
        doctorName = doctorName[0].name;

        const data = {
            id: obj.id,
            name: doctorName,
            type0: obj.type,
            type: `Prescription Dissapproval by ${doctorName}`,
            date: obj.date,
            redirect: `/ShowAlarms/${patientID}`,
            alarmId: alarmId,
            isOpened: obj.isOpened,
        }

        return data;

    } catch (error) {
        console.log(error)
        return null;

    }

}

const generateNewProgramEnrollmentAlert = async (obj) => {
    try {
        const patientId = obj.patientId;
        const patientNameQuery = `SELECT name FROM patients WHERE id = '${patientId}'`;
        var patientNameResult = await pool.query(patientNameQuery);
        if (!patientNameResult) return;
        patientName = patientNameResult[0].name;
        const programName = obj.programName;
        var patientProfilePhoto = patientNameResult[0].profile_photo

        const data = {
            id: obj.id,
            name: patientName,
            patientId: patientId,
            patientProfilePhoto: patientProfilePhoto,
            type0: obj.type,
            type: `New Program Enrollment for ${patientName} in ${programName}`,
            date: obj.date,
            redirect: `/userProgramSelection`,
            isOpened: obj.isOpened,
        }
        return data;

    } catch (error) {
        console.log(error)
        return null;

    }

}

const generateNewEnrollmentAlert = async (obj) => {
    try {
        const patientId = obj.patientId;
        const patientNameQuery = `SELECT name FROM patients WHERE id = '${patientId}'`;
        var patientNameResult = await pool.query(patientNameQuery);
        if (!patientNameResult) return;
        var patientName = patientNameResult[0].name;
        var patientProfilePhoto = patientNameResult[0].profile_photo

        const data = {
            id: obj.id,
            name: patientName,
            patientId: patientId,
            patientProfilePhoto: patientProfilePhoto,
            type0: obj.type,
            type: `New Enrollment by ${patientName}`,
            date: obj.date,
            redirect: `/patient/${patientId}`,
            isOpened: obj.isOpened,
        }

        return data;

    } catch (error) {
        console.log(error)
        return null;

    }

}

const generateMissedPrescriptionAlarmAlert = async (obj) => {

    try {
        const alarmId = obj.alarmId;
        const getDoctorIdQuery = `SELECT doctorId FROM alarm WHERE id = '${alarmId}'`;
        if (!getDoctorIdQuery) return;
        let doctorId;
        try {
            doctorId = await pool.query(getDoctorIdQuery);
            if (!doctorId) return;

        } catch (error) {
            return null;

        }
        doctorId = doctorId[0].doctorId
        // console.log(doctorId);
        const patientId = obj.patientId;
        const doctorNameQuery = `SELECT name FROM doctors WHERE id = '${doctorId}'`;
        var doctorName = await pool.query(doctorNameQuery);
        if (!doctorName) return;
        doctorName = doctorName[0].name;
        const patientNameQueryResult = `SELECT * FROM patients WHERE id = '${patientId}'`;
        var patientName = patientNameQueryResult[0].name;
        var patientProfilePhoto = patientNameQueryResult[0].profile_photo;


        const data = {
            id: obj.id,
            name: doctorName,
            patientId: patientId,
            patientProfilePhoto: patientProfilePhoto,
            type0: obj.type,
            type: `Missed Prescription Alarm for ${patientName}`,
            date: obj.date,
            redirect: `/ShowAlarms/${patientID}`,
            alarmId: alarmId,
            isOpened: obj.isOpened,
        }

        // console.log(data);

        return data;

    } catch (error) {
        console.log(error)
        return null;

    }


}


const generateMissedAlarmAlert = async (obj, did) => {

    try {
        const alarmId = obj.alarmId;
        const patientId = obj.patientId;
        const getPatientNameQuery = `SELECT name FROM patients WHERE id = '${patientId}'`;
        if (!getPatientNameQuery) return;
        var patientNameResult = await pool.query(getPatientNameQuery);

        var patientName = patientNameResult[0].name;
        var patientProfilePhoto = patientNameResult[0].profile_photo;
        const getIsreadquery = `SELECT * FROM alertsread WHERE alertId = ${obj.id} AND doctorId = ${did} AND dailyordia = 'Missed Alarm' `
        let isRead;
        try {
            isRead = await pool.query(getIsreadquery);
            // isRead = isRead[0].isRead;
            // console.log("isRead",isRead)

        } catch (error) {
            return null

        }
        let realisRead = 1;
        if (isRead.length > 0) {
            realisRead = isRead[0].isRead;
        }
        const data = {
            id: obj.id,
            name: patientName,
            patientId: patientId,
            patientProfilePhoto: patientProfilePhoto,
            type0: obj.type,
            type: `Doctor Please Check Digital Prescription its been more than 3 days for ${patientName}`,
            date: obj.date,
            redirect: `/ShowAlarms/${patientId}`,
            alarmId: alarmId,
            color: "red",
            dailyordia: "Missed Alarm",
            patientId: patientId,
            isRead: realisRead,
            isOpened: obj.isOpened,

        }
        return data;

    } catch (error) {
        console.log(error)
        return null;

    }

}



const generateNewPrescriptionAlarmAlert = async (obj, did) => {
    try {

        
        const alarmId = obj.alarmId;
        console.log(did+alarmId)
        // console.log("AlarmId", alarmId)
        const patientId = obj.patientId;
        const getPatientNameQuery = `SELECT name FROM patients WHERE id = '${patientId}'`;
        var patientNameResult = await pool.query(getPatientNameQuery);
        if (!patientNameResult) return null;
        var patientName = patientNameResult[0].name;
        var patientProfilePhoto = patientNameResult[0].profile_photo

        // console.log("PatientName", patientName
        // )
        const getAlarmQuery = `SELECT * FROM alarm WHERE id = ${alarmId} AND doctorId = ${did}`;
        let alarm;
        try {
            const alarmQueryResult = await pool.query(getAlarmQuery);
            if (alarmQueryResult.length > 0) {
                alarm = alarmQueryResult[0];
            } else {
                console.log("No alarm found with the specified ID and doctor ID");
                return null;
            }

        } catch (error) {
            console.log(error)
            return null;

        }
        console.log(alarm)
        // alarm = alarm[0];
        // console.log("Alamar",alarm);
        // console.log("Alarm", alarm)
        // console.log("Did",did)
        // if (did!=alarm.doctorId){
        //     return null;
        // }
        const presId = alarm.prescriptionid;
        const getPrescriptionQuery = `SELECT * FROM prescriptions WHERE id = '${presId}'`;
        var prescription = await pool.query(getPrescriptionQuery);
        prescription = prescription[0];
        // console.log(prescription);
        const presImg = prescription.Prescription
        const presDate = prescription.Date;
         const desc = alarm.description;
        const weekdays = alarm.weekdays || alarm.dateofmonth;
        const time = alarm.time;
        const timesaday = alarm.timesaday || alarm.timesamonth;
        const getDoses = `SELECT * FROM alarm_doses WHERE alarmId = '${alarmId}'`;
        var doses = await pool.query(getDoses);
        const unit = doses[0].unitType;
        var dose = []
        for (var i = 0; i < doses.length; i++) {
            dose.push(`${doses[i].time} ${doses[i].doses} ${unit}`);
        }

        const isWeek = alarm.weekdays ? true : false;

        const data = {
            id: obj.id,
            name: patientName,
            type0: obj.type,
            type: `New Prescription Alarm for ${patientName}`,
            date: obj.date,
            redirect: `/ShowAlarms/${patientId}`,
            alarmId: alarmId,
            presImg: presImg,
            presDate: presDate,
            presId: presId,
            desc: desc,
            weekdays: weekdays,
            time: time,
            timesaday: timesaday,
            doses: dose,
            isWeek: isWeek,
            patientId: patientId,
            patientProfilePhoto: patientProfilePhoto

        }
        return data

    } catch (error) {
        console.log(error)
        return null;
    }



}


const generateLabResultsAlert = async (obj) => {
    try {
        const labReportId = obj.labReportId;
        const getLabReportQuery = `SELECT * FROM labreport WHERE id = '${labReportId}'`;
        var labReport = await pool.query(getLabReportQuery);
        if (!labReport) return;
        labReport = labReport[0];
        if (!labReport) return;

        // console.log(labReport)
        const patientId = labReport.patientId;
        const getPatientNameQuery = `SELECT name FROM patients WHERE id = '${obj.patientId}'`;
        var patientNameResult = await pool.query(getPatientNameQuery);
        // console.log(patientName);
        var patientName = patientNameResult[0].name;
        var patientProfilePhoto = patientNameResult[0].profile_photo;

        const data = {
            id: obj.id,
            name: patientName,
            type0: obj.type,
            type: `New Lab Report Uploaded for ${patientName}`,
            date: obj.date,
            redirect: `/UserLabReports/${obj.patientId}`,
            labReportId: labReportId,
            patientId: patientId,
            patientProfilePhoto: patientProfilePhoto,
            isOpened: obj.isOpened,

        }

        return data;

    } catch (error) {
        console.log(error)
        return null;

    }

}

const generatecontactUsAlert = async (obj) => {
    try {
        const data = {
            id: obj.id,
            name: "Contact Us",
            type0: "patient",
            type: `Contact us request from ${obj.userEmail}`,
            date: obj.date,
            redirect: `/contactus/${obj.id}`,
            isOpened: obj.isOpened,
            missedAlertId: obj.missedAlertId,

        };
        return data;

    } catch (error) {
        console.log(error)
        return null;

    }



}

const getContactAlerts = async () => {
    // console.log('getContactAlerts');

    try {
        const query = `SELECT * FROM contactus`;
        const contactus = await pool.query(query);
        // console.log(contactus)
        var alerts = [];
        for (var i = 0; i < contactus.length; i++) {
            const temp = await generatecontactUsAlert(contactus[i]);
            // console.log(temp)
            if (temp) {
                alerts.push(temp);
            }
        }
        return alerts;

    } catch (error) {
        console.log(error)
        return null;

    }

}

const generateAnyMissedAlert = async (obj) => {

    try {
        const patientId = obj.patientId;
        var patientName, patientProfilePhoto;
        if (patientId) {
            const getPatientNameQuery = `SELECT name FROM patients WHERE id = '${obj.patientId}'`;
            var patientNameResult = await pool.query(getPatientNameQuery);
            patientName = patientNameResult[0].name;
            patientProfilePhoto = patientNameResult[0].profile_photo;
        }

        var redirect;

        if (obj.category === "Doctor Message to Admin") {
            const chatId = obj.chatId;
            const getChatQuery = `SELECT * FROM chat WHERE id = '${chatId}'`;
            var chat = await pool.query(getChatQuery);
            chat = chat[0];
            
            redirect=`/adminChat/${chat.patientid}`


        } else if (obj.category === "Prescription Disapproved") {
            redirect=`/ShowAlarms/${patientId}`

        } else if (obj.category === "New Program Enrollment") {
            redirect = "/userProgramSelection"

        } else if (obj.category === "Missed Alarm") {
             redirect=`/ShowAlarms/${patientId}`

        } else if (obj.category === "New Lab Report") {
            redirect=`/UserLabReports/${patientId}`

        } else if (obj.category === "New Prescription") {
            redirect=`/userPrescription/${patientId}`

        } else if (obj.category === "Contact Us") {
            redirect=`/contactus/${patientId}`

        } else if (obj.category === "Delete Account") {
            redirect = `/patient/${patientId}`
        } else {
            redirect=`/`
        }

        const data = {
            id: obj.id,
            name: patientName,
            type0: obj.type,
            type: "Not Viewed for more than 1 day: " + obj.category,
            date: obj.date,
            redirect: `/UserLabReports/${obj.patientId}`,
            patientId: patientId,
            patientProfilePhoto: patientProfilePhoto,
            isOpened: obj.isOpened,
            missedAlertId: obj.missedAlertId,

        }
        return data;

    } catch (error) {
        console.log(error)
        return null;

    }


}

const generateNewPrescriptionAlert = async (obj) => {
    try {
        const prescriptionId = obj.prescriptionId;
        const Query = `SELECT * FROM prescriptions WHERE id = '${prescriptionId}'`;
        var prescription = await pool.query(Query);
        prescription = prescription[0];
        if (!prescription) return null;

        // console.log(labReport)
        const patientId = prescription.patient_id;
        const getPatientNameQuery = `SELECT name FROM patients WHERE id = '${obj.patientId}'`;
        var patientNameResult = await pool.query(getPatientNameQuery);
        // console.log(patientName);
        var patientName = patientNameResult[0].name;
        var patientProfilePhoto = patientNameResult[0].profile_photo;

        const data = {
            id: obj.id,
            name: patientName,
            type0: obj.type,
            type: `New Prescription Uploaded for ${patientName}`,
            date: obj.date,
            redirect: `/userPrescription/${obj.patientId}`,
            labReportId: prescriptionId,
            patientId: patientId,
            patientProfilePhoto: patientProfilePhoto,
            isOpened: obj.isOpened,

        }

        return data;

    } catch (error) {
        console.log(error);
        return null;
    }

}

const generateDeleteAccountAlert = async (obj) => {

    try {
        // console.log(labReport)
        const patientId = obj.patientId;
        const getPatientNameQuery = `SELECT name FROM patients WHERE id = '${obj.patientId}'`;
        var patientNameResult = await pool.query(getPatientNameQuery);
        // console.log(patientName);
        var patientName = patientNameResult[0].name;
        var patientProfilePhoto = patientNameResult[0].profile_photo;

        const data = {
            id: obj.id,
            name: patientName,
            type0: obj.type,
            type: `Account Deletion Request for ${patientName}`,
            date: obj.date,
            redirect: `/patient/${obj.patientId}`,
            patientId: patientId,
            patientProfilePhoto: patientProfilePhoto,
            isOpened: obj.isOpened,
        }

        return data;

    } catch (error) {
        console.log(error);
        return null;

    }


}

const getAdminAlerts = async (req, res) => {
    // console.log("In admin alerts!!!")
    try {
        const { admin_id } = req.params;

        // Fetch patients assigned to the admin
        const assignedPatientsQuery = `SELECT patient_id FROM admin_patients WHERE admin_id = '${admin_id}'`;
        const assignedPatientsResult = await pool.query(assignedPatientsQuery);
        // console.log(assignedPatientsResult)
        // console.log("assignedPatientsResult", assignedPatientsResult);
        const assignedPatients = assignedPatientsResult.map(row => row.patient_id);

        // Fetch doctors assigned to patients
        const doctorsQuery = `SELECT doctor_id, patient_id FROM doctor_patients WHERE patient_id IN (${assignedPatients.join(',')})`;
        const doctorsResult = await pool.query(doctorsQuery);
        // console.log("doctorsResult", doctorsResult);
        const doctorPatientMap = {};
        doctorsResult.forEach(row => {
            if (!doctorPatientMap[row.patient_id]) {
                doctorPatientMap[row.patient_id] = [];
            }
            doctorPatientMap[row.patient_id].push(row.doctor_id);
        });

        var alerts = [];
        // console.log(assignedPatients)

        // Fetch alerts for assigned patients
        for (const patientId of assignedPatients) {
            // console.log(patientId)
            const patientAlerts = await pool.query(`SELECT * FROM alerts WHERE patientId = '${patientId}' and missedAlertId IS NULL`);
            alerts.push(...patientAlerts);
        }

        // console.log("alerts", alerts);  

        var filteredAlerts = [];

        for (const alert of alerts) {
            if (alert.category.slice(0, 23).trim() === "Doctor Message to Admin" ||
                alert.category === "Prescription Disapproved" ||
                alert.category === "New Program Enrollment" ||
                alert.category === "New Enrollment" ||
                alert.category === "Missed Prescription Alarm" ||
                alert.category === "New Lab Report" ||
                alert.category === "New Prescription" ||
                alert.category === "Delete Account" ||
                alert.category === "Contact Us" ||
                alert.category.toLowerCase().includes("missed") && alert.category !="Missed Alarm") {
                if (alert) {
                    filteredAlerts.push(alert);
                }
            }
        }




        // console.log("filteredAlerts", filteredAlerts);

        var finalAlerts = [];
        // console.log("alerts",alerts)

        for (const alert of filteredAlerts) {

            if (alert.category.slice(0, 23).trim() === "Doctor Message to Admin") {
                const temp = await generateDoctorMessageToAdminAlert(alert);
                // console.log(admin_id)
                if (admin_id == 1) {
                    finalAlerts.push(temp);
                }
                else if ((temp && temp.adminId == admin_id)) {
                    finalAlerts.push(temp);
                }
            } else if (alert.category === "Prescription Disapproved") {
                let disapprovalAlert = await generatePrescriptionDisapprovalAlert(alert);
                // console.log(disapprovalAlert)
                if (disapprovalAlert) {
                    finalAlerts.push(disapprovalAlert);
                }
            } else if (alert.category === "New Program Enrollment") {
                const temp = await generateNewProgramEnrollmentAlert(alert);
                if (temp) {
                    finalAlerts.push(temp);
                }
            } else if (alert.category === "New Enrollment") {
                const temp = await generateNewEnrollmentAlert(alert);
                if (temp) {
                    finalAlerts.push(temp);
                }
            } else if (alert.category === "Missed Prescription Alarm") {
                const temp = await generateMissedPrescriptionAlarmAlert(alert);
                if (temp) {
                    finalAlerts.push(temp);
                }
            } else if (alert.category === "New Lab Report") {
                const temp = await generateLabResultsAlert(alert);
                if (temp) {
                    finalAlerts.push(temp);
                }
            } else if (alert.category.toLowerCase().includes("missed")) {
                const temp = await generateAnyMissedAlert(alert);
                if (temp) {
                    finalAlerts.push(temp);
                }
            } else if (alert.category == "New Prescription") {
                const temp = await generateNewPrescriptionAlert(alert);
                if (temp) {
                    finalAlerts.push(temp);
                }
            } else if (alert.category == "Delete Account") {
                console.log("Delete Account")
                const temp = await generateDeleteAccountAlert(alert);
                console.log(temp)
                if (temp) {

                    finalAlerts.push(temp);
                }
            } else if (alert.category === "Contact Us") {
                const temp = await generatecontactUsAlert(alert);
                if (temp) {
                    finalAlerts.push(temp);
                }
            }

        }
        // const contactAlerts = await getContactAlerts();
        // if (contactAlerts) {
        //     finalAlerts.push(...contactAlerts);
        // }
        // console.log("finalAlerts", finalAlerts);

        if (req.user.id === 1) {
            // the user is super admin
            const superAdminExtraAlerts = await getSuperAdminExtraAlerts(req, res);
            for (const alert of superAdminExtraAlerts) {
                const missedAlert = await generateAnyMissedAlert(alert);
                if (missedAlert) {
                    finalAlerts.push(missedAlert);
                }
            }
        }

        // console.log(finalAlerts)

        res.send(finalAlerts);

    } catch (error) {
        console.log("Error sorting alerts", error)
        res.status(401).json({
            success: false,
            data: error
        })
    }
}

const getSuperAdminExtraAlerts = async (req, res) => {
    const query = `SELECT * from alerts where missedAlertId is NOT NULL`;
    try {
        const missedAlertsForSuperAdmin = await pool.execute(query);
        return missedAlertsForSuperAdmin;
    } catch (error) {
        return [];
    }

}




const structureReadingAlert = async (obj, did) => {
    const patientId = obj.patientId;
    // console.log("In Structure Readings Alerts",obj)
    const patientNameQuery = `SELECT * FROM patients WHERE id = '${patientId}'`;
    var patientNameResult = await pool.query(patientNameQuery);
    const isReadQuery = `SELECT * FROM alertsread WHERE alertId = '${obj.id}' and dailyordia = '${obj.dailyordia}' and doctorId = '${did} and isRead=0'`;

    let isRead;
    try {
        isRead = await pool.query(isReadQuery);

    } catch (error) {
        console.log(error)

    }
    let realIsRead = 1;
    if (isRead.length > 0) {
        realIsRead = isRead[0].isRead;
    }
    // console.log(isRead[0]?.isRead)


    var patientName = patientNameResult[0].name;
    var patientID = patientNameResult[0].id;
    var patientProfilePhoto = patientNameResult[0].profile_photo

    // console.log(patientNameResult)
    const uptype = obj.Type;
    // find https: in ALertText and split it from there to end
    let imgurl = null;
    if (uptype === 'Upload') {
        imgurl = obj.AlertText.split("https:");
        imgurl = 'https:' + imgurl[1];
        // imgurl = imgurl.slice(0, -1);
    }
    // console.log(imgurl)

    // console.log("reading alerts question id",obj.questionId)
    var isGraph, questionTitle, questionUnit, questionType;
    try {
        var tableName;
        if (obj.dailyordia === "daily") {
            tableName = 'daily_readings'
        } else if (obj.dailyordia === "dialysis") {
            tableName = 'dialysis_readings'
        }
        const query = `select * from ${tableName} where id=${obj.questionId}`
        var dailyReadingsInfo = await pool.query(query);
        // console.log(dailyReadingsInfo)
        isGraph = dailyReadingsInfo[0].isGraph;
        questionTitle = dailyReadingsInfo[0].title;
        questionUnit = dailyReadingsInfo[0].unit;
        questionType = dailyReadingsInfo[0].type;
    } catch (error) {
        console.log(error)
    }

    const data = {
        id: obj.id,
        name: patientName,
        patientID: patientID,
        patientProfilePhoto, patientProfilePhoto,
        type: obj.AlertText,
        date: obj.Date,
        color: obj.color,
        redirect: '',
        isRead: realIsRead,
        image: imgurl,
        dailyordia: obj.dailyordia,
        patientId: patientId,
        questionId: obj.questionId,
        isGraph: isGraph,
        questionTitle: questionTitle,
        questionUnit: questionUnit,
        patientId: patientId,
        questionType: questionType,
        isOpened: obj.isOpened,
    }

    return data;
}

const getDoctorAlerts = async (req, res) => {
    const { doctor_id } = req.params;
    var alerts = [];
    const patientAlerts = await pool.query(
        `
            SELECT *
            FROM alerts
            WHERE patientId IN (
                SELECT patient_id
                FROM doctor_patients
                WHERE doctor_id = ${doctor_id}
            );
        `
    )
    alerts = patientAlerts;
    // var reading = []
    // const readingAlertsQueryWhoseEnteryIsPresentInAlertsReadTable = `
    //     SELECT ra.*
    //     FROM readingalerts ra
    //     JOIN doctor_patients dp ON ra.patientId = dp.patient_id
    //     WHERE dp.doctor_id = ${doctor_id}
    //     AND ra.id IN (
    //         SELECT ar.alertId
    //         FROM alertsread ar
    //         WHERE ar.doctorId = ${doctor_id}
    //     );
    // `
    // const readingAlerts = await pool.query(readingAlertsQueryWhoseEnteryIsPresentInAlertsReadTable);
    // reading = readingAlerts


    var finalAlerts = [];
console.log(alerts)

    for (var i = 0; i < alerts.length; i++) {
        if (alerts[i].category === "New Prescription Alarm") {
            const palert = await generateNewPrescriptionAlarmAlert(alerts[i], doctor_id);
            if (palert) {
                console.log(palert)
                finalAlerts.push(palert);
            }
        }
        else if (alerts[i].category === "Missed Alarm") {
            const malert = await generateMissedAlarmAlert(alerts[i], doctor_id);
            if (malert) {
                finalAlerts.push(malert);
            }
        }
    }

    // for (var i = 0; i < reading.length; i++) {
    //     const ralert = await structureReadingAlert(reading[i], doctor_id);
    //     if (ralert) {
    //         finalAlerts.push(ralert);
    //     }
    // }
    res.status(200).send(finalAlerts);
}

module.exports = { getAdminAlerts, getDoctorAlerts, generateNewPrescriptionAlarmAlert, generateLabResultsAlert, structureReadingAlert, getSuperAdminExtraAlerts }
