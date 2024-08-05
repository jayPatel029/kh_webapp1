const { Appointments } = require("../Models/teleModels.js");
const { pool, sequelize } = require("../databaseConn/database.js");
const moment = require('moment');

const getPatientByAge = async (req, res, next) => {
    try {
        if (req.user.role != "Doctor") return res.status(404).json({
            message: "You are not authorized to access this resource"
        }
        )

        // console.log(req.user)
        const doctor_id = req.user.id;
        // console.log(doctor_id)

        let query = `select * from doctors where email = '${req.user.email}'`;
        const doctorResult = await pool.query(query);
        const doctorId = doctorResult[0].id;

        // Construct SQL query to fetch patients and categorize them into age groups
        let sql = `
            SELECT
                CAST(p.id AS CHAR) AS id,
                p.name,
                p.dob,
                p.profile_photo,
                CAST(TIMESTAMPDIFF(YEAR, p.dob, CURDATE()) AS CHAR) AS age -- Convert age to CHAR
            FROM patients p
            INNER JOIN doctor_patients dp ON p.id = dp.patient_id
            WHERE dp.doctor_id = ${doctorId}    
        `;

        console.log("doctorId", doctorId)

        // Execute the query
        const result = await pool.query(sql);

        console.log(result)

        // Initialize an object to store patients grouped by age ranges
        let ageGroups = {
            under18: [],
            from18to30: [],
            from31to50: [],
            over50: []
        };

        // Loop through the result and categorize patients into age groups
        result.forEach(patient => {
            // Convert age to Number if needed, depending on your application logic
            // patient.age = Number(patient.age); // Uncomment if conversion to Number is needed

            if (Number(patient.age) < 18) {
                ageGroups.under18.push(patient);
            } else if (Number(patient.age) >= 18 && Number(patient.age) <= 30) {
                ageGroups.from18to30.push(patient);
            } else if (Number(patient.age) > 30 && Number(patient.age) <= 50) {
                ageGroups.from31to50.push(patient);
            } else {
                ageGroups.over50.push(patient);
            }
        });

        console.log(ageGroups)

        // Return the segregated age groups as JSON response
        res.status(200).json({
            success: true,
            data: ageGroups,
        });

    } catch (error) {
        console.error("Error in getPatientByAge:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

const getPatientByGender = async (req, res, next) => {
    try {
        // Check if user role is Doctor
        if (req.user.role !== "Doctor") {
            return res.status(403).json({
                message: "You are not authorized to access this resource"
            });
        }

        // Fetch doctor_id from authenticated user
        const doctor_id = req.user.id;

        // Fetch doctor's details to get doctor_id
        let query = `SELECT id FROM doctors WHERE email = '${req.user.email}'`;
        const doctorResult = await pool.query(query);
        const doctorId = doctorResult[0].id;

        // Construct SQL query to fetch patients and categorize them by gender
        let sql = `
            SELECT
                CAST(p.id AS CHAR) AS id,
                p.name,
                p.dob,
                p.profile_photo,
                p.gender
            FROM patients p
            INNER JOIN doctor_patients dp ON p.id = dp.patient_id
            WHERE dp.doctor_id = ${doctorId}    
        `;

        // Execute the query
        const result = await pool.query(sql);

        // Initialize an object to store patients grouped by gender
        let genderGroups = {
            male: [],
            female: [],
            other: []
        };

        console.log("result", result)

        // Loop through the result and categorize patients into gender groups
        result.forEach(patient => {
            if (!patient.gender) {
                genderGroups.other.push(patient);
            }
            else if (patient.gender.toLowerCase() === 'male') {
                genderGroups.male.push(patient);
            } else if (patient.gender.toLowerCase() === 'female') {
                genderGroups.female.push(patient);
            } else {
                genderGroups.other.push(patient);
            }
        });

        // Return the segregated gender groups as JSON response
        res.status(200).json({
            success: true,
            data: genderGroups,
        });

    } catch (error) {
        console.error("Error in getPatientByGender:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

// Function to fetch appointments grouped by date
const getAppointmentsByDate = async (req, res) => {
    try {
        const results = await Appointments.findAll({
            attributes: [
                'appointment_date',
                [sequelize.fn('COUNT', sequelize.literal('DISTINCT CASE WHEN appointment_type = "online" THEN appointment_id END')), 'online_count'],
                [sequelize.fn('COUNT', sequelize.literal('DISTINCT CASE WHEN appointment_type = "inperson" THEN appointment_id END')), 'inperson_count'],
            ],
            group: ['appointment_date'],
            raw: true,
        });

        // Mapping results to the desired format
        const formattedResults = results.map(result => ({
            date: result.appointment_date,
            online: parseInt(result.online_count),
            inperson: parseInt(result.inperson_count),
        }));

        res.status(200).json({
            success: true,
            data: formattedResults,
        })
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        })
    }
};


const getPercentageReturn = async (req, res) => {
    try {
        // Fetch all appointment data
        const appointments = await Appointments.findAll({ order: [['patient_id', 'ASC'], ['appointment_date', 'ASC']] });

        // Function to categorize intervals and calculate percentages
        const categorizeIntervals = (appointments) => {
            let intervals = { "0-10 days": 0, "11-20 days": 0, "21-30 days": 0, "31-40 days": 0, "41+ days": 0 };
            let patientFirstVisits = {};

            appointments.forEach(appointment => {
                const { patient_id, appointment_date } = appointment;

                if (!patientFirstVisits[patient_id]) {
                    patientFirstVisits[patient_id] = moment(appointment_date);
                } else {
                    const firstVisitDate = patientFirstVisits[patient_id];
                    const currentVisitDate = moment(appointment_date);
                    const daysInterval = currentVisitDate.diff(firstVisitDate, 'days');

                    if (daysInterval <= 10) intervals["0-10 days"]++;
                    else if (daysInterval <= 20) intervals["11-20 days"]++;
                    else if (daysInterval <= 30) intervals["21-30 days"]++;
                    else if (daysInterval <= 40) intervals["31-40 days"]++;
                    else intervals["41+ days"]++;
                }
            });

            const totalReturningPatients = Object.values(intervals).reduce((a, b) => a + b, 0);
            const intervalData = Object.keys(intervals).map(interval => {
                return {
                    name: interval,
                    percentage: totalReturningPatients ? ((intervals[interval] / totalReturningPatients) * 100).toFixed(2) : 0
                };
            });

            return intervalData;
        };

        // Get interval data and send as JSON response
        const result = categorizeIntervals(appointments);
        res.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error("Error fetching appointments: ", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getAdherenceMedicine = async (req, res) => {
    if (req.user.role != "Doctor") return res.status(404).json({
        message: "You are not authorized to access this resource"
    }
    )

    try {
        // Check if user is authorized as a doctor
        if (req.user.role !== 'Doctor') {
          return res.status(403).json({ message: 'You are not authorized to access this resource' });
        }
    
        // Fetch doctor's ID based on their email
        const queryDoctor = `SELECT id FROM doctors WHERE email = '${req.user.email}'`;
        const doctorResult = await pool.query(queryDoctor);
        const doctorId = doctorResult[0].id;
    
        // Query to count alerts for missed alarms by patients assigned to this doctor
        const query = `
        SELECT p.id AS patientId, p.name AS patientName, p.number AS patientNumber, CAST(COUNT(a.id)as Char) AS missedAlertsCount
        FROM patients p
        INNER JOIN alerts a ON p.id = a.patientId
        WHERE a.category = 'Missed Alarm' 
        AND a.patientId IN (
          SELECT patient_id 
          FROM doctor_patients 
          WHERE doctor_id = ?
        )
        GROUP BY p.id, p.name, p.number
      `;
        const alertsResult = await pool.query(query, [doctorId]);
        res.status(200).json({ success: true, data: alertsResult });
      } catch (error) {
        console.error('Error fetching adherence medicine:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }




};




module.exports = {
    getPatientByAge,
    getPatientByGender,
    getAppointmentsByDate,
    getPercentageReturn,
    getAdherenceMedicine
};
