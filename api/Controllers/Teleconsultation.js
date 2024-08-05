const { pool } = require("../databaseConn/database.js");
const {Services, Bills, Appointments, Vitals }  = require("../Models/teleModels.js");

const bookAppointment = async (req, res, next) => {
    try {
        const { patient_id, doctor_id, service_id, appointment_date, appointment_time, vitals } = req.body;

        // Find the selected service to get its cost
        const service = await Services.findByPk(service_id);
        if (!service) {
            return res.status(400).send("Service not found.");
        }

        // Calculate the cost of the service
        const serviceCost = service.cost;

        // Calculate the total cost based on the service cost and any additional charges (if applicable)
        // For simplicity, let's assume there are no additional charges
        const totalCost = serviceCost;

        // Create a bill with the calculated amount and status as pending
        const bill = await Bills.create({
            amount: totalCost,
            status: "pending"
        });

        // Create the vitals record
        const createdVitals = await Vitals.create({
            blood_pressure: vitals.blood_pressure,
            heart_rate: vitals.heart_rate,
            temperature: vitals.temperature,
            weight: vitals.weight,
            patient_id: patient_id
        });

        // Create an appointment with the appointment details, vitals ID, and the bill ID
        const appointment = await Appointments.create({
            patient_id,
            doctor_id,
            service_id,
            appointment_date,
            appointment_time,
            status: "booked", // Assuming appointment status is pending until it is confirmed
            bill_id: bill.bill_id, // Associate the appointment with the created bill
            vitals_id: createdVitals.vitals_id // Associate the appointment with the created vitals
        });

        // Return the appointment, bill, and created vitals information in the response
        return res.status(201).json({ appointment, bill, vitals: createdVitals });
    } catch (error) {
        console.error("Error booking appointment:", error);
        return res.status(500).send("An error occurred while booking the appointment.");
    }
};

const getAllAppointments = async (req, res, next) => {
    try {
        // Fetch all appointments
        const email = req.user.email;
        const doctorIDQuery = `select * from doctors where email='${email}'`
        const doctorResult = await pool.query(doctorIDQuery);
        const doctorID = doctorResult[0].id;
        const appointments = await Appointments.findAll({
            where: {
                doctor_id: doctorID
            }
        });
        // Return the appointments in the response
        return res.status(200).json(appointments);
    } catch (error) {
        console.error("Error fetching appointments:", error);
        return res.status(500).send("An error occurred while fetching appointments.");
    }
};

module.exports = {
    bookAppointment,
    getAllAppointments,
}