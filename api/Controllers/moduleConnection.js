const { QueryTypes } = require("sequelize");
const { sequelize, pool } = require("../databaseConn/database");

// Create connection table
const createConnectionTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS module_connection (
      id INT AUTO_INCREMENT PRIMARY KEY,
      old_entity_id INT NOT NULL,
      new_entity_id INT NOT NULL,
      entity_type ENUM('doctor', 'patient') NOT NULL,
      is_connected BOOLEAN DEFAULT FALSE,
      connected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_connection (old_entity_id, entity_type)
    );
  `;

  try {
    await sequelize.query(query);
    console.log("Module connection table created successfully");
  } catch (error) {
    console.error("Error creating module connection table:", error);
  }
};

// connect doc!
const connectDoctor = async (oldDoctorId, newDoctorId) => {
  try {
    await sequelize.query(
      `INSERT INTO module_connection 
       (old_entity_id, new_entity_id, entity_type, is_connected) 
       VALUES (?, ?, 'doctor', TRUE)
       ON DUPLICATE KEY UPDATE 
       new_entity_id = VALUES(new_entity_id),
       is_connected = TRUE,
       connected_at = CURRENT_TIMESTAMP`,
      [oldDoctorId, newDoctorId]
    );
    return true;
  } catch (error) {
    console.error("Error connecting doctor:", error);
    return false;
  }
};

// ! connect patient
const connectPatient = async (req, res) => {
  const { old_pid, new_pid } = req.body;
  try {
    await sequelize.query(
      `INSERT INTO module_connection 
       (old_entity_id, new_entity_id, entity_type, is_connected) 
       VALUES (:old_pid, :new_pid, 'patient', TRUE)
       ON DUPLICATE KEY UPDATE 
       new_entity_id = VALUES(new_entity_id),
       is_connected = TRUE,
       connected_at = CURRENT_TIMESTAMP`,
      {
        replacements: {
          old_pid,
          new_pid,
        },
        type: QueryTypes.INSERT,
      }
    );

    res.status(200).json({
      message: "Connection established successfully",
    });
  } catch (error) {
    console.error("Error connecting patient:", error);
    res.status(500).json({ error: "Error Connecting Patients!!" });
  }
};

// ? check if connected or not!
const isConnected = async (oldEntityId, entityType) => {
  try {
    const rows = await sequelize.query(
      "SELECT is_connected, new_entity_id FROM module_connection WHERE old_entity_id = :oldEntityId AND entity_type = :entityType",
      {
        replacements: { oldEntityId, entityType },
        type: QueryTypes.SELECT,
      }
    );
    return rows[0] || null;
  } catch (error) {
    console.error("Error checking connection:", error);
    return null;
  }
};

// patient's prescriptions
// const getPatientPrescriptions = async (req, res) => {
//   const { old_pid } = req.query;

//   try {
//     const connection = await isConnected(old_pid, "patient");
//     if (!connection || !connection.is_connected) {
//       return res.status(404).json({ error: "Patient not connected" });
//     }

//     const [prescriptions] = await sequelize.query(
//       `
//       SELECT 
//     p.*, 
//     a.patient_id, 
//     a.doctor_id,
//     d.doctor AS doctor_name,
//     GROUP_CONCAT(m.name) AS medicines,
//     GROUP_CONCAT(m.dosage) AS dosages,
//     GROUP_CONCAT(m.frequency) AS frequencies
// FROM tele_prescription p
// LEFT JOIN tele_appointments a ON p.appointment_id = a.id
// LEFT JOIN tele_doctor d ON a.doctor_id = d.id
// LEFT JOIN tele_medicines m ON p.id = m.prescription_id
// WHERE a.patient_id = :new_pid
// GROUP BY p.id
// ORDER BY p.created_at DESC;

//        `,
//       {
//         replacements: {
//           new_pid: connection.new_entity_id,
//         },
//         type: QueryTypes.SELECT,
//       }
//     );
//     // return prescriptions;
//     res.status(200).json({
//       message: "Prescription data fetched successfully",
//       data: prescriptions || [],
//     });
//   } catch (error) {
//     console.error("Error getting patient prescriptions:", error);
//     res.status(500).json({
//       error: "Error getting presription!",
//     });
//     // return null;
//   }
// };


const getPatientPrescriptions = async (req, res) => {
  const { old_pid } = req.query;

  try {
    const connection = await isConnected(old_pid, "patient");
    if (!connection || !connection.is_connected) {
      return res.status(404).json({ error: "Patient not connected" });
    }

    const new_pid = connection.new_entity_id;

    // Step 1: Get all prescriptions with doctor and patient info
    const prescriptions = await sequelize.query(
      `
      SELECT 
        p.*, 
        a.patient_id, 
        a.doctor_id,
        d.doctor AS doctor_name
      FROM tele_prescription p
      LEFT JOIN tele_appointments a ON p.appointment_id = a.id
      LEFT JOIN tele_doctor d ON a.doctor_id = d.id
      WHERE a.patient_id = :new_pid
      ORDER BY p.created_at DESC;
      `,
      {
        replacements: { new_pid },
        type: QueryTypes.SELECT,
      }
    );

    // Extract prescription IDs
    const prescriptionIds = prescriptions.map(p => p.id);
    if (prescriptionIds.length === 0) {
      return res.status(200).json({
        message: "No prescriptions found",
        data: [],
      });
    }

    // Step 2: Get all medicines for those prescriptions
    const medicines = await sequelize.query(
      `
      SELECT * FROM tele_medicines
      WHERE prescription_id IN (:prescriptionIds);
      `,
      {
        replacements: { prescriptionIds },
        type: QueryTypes.SELECT,
      }
    );

    // Step 3: Attach medicines to corresponding prescriptions
    const prescriptionsWithMedicines = prescriptions.map(prescription => ({
      ...prescription,
      medicines: medicines.filter(med => med.prescription_id === prescription.id),
    }));

    // Final response
    res.status(200).json({
      message: "Prescription data fetched successfully",
      data: prescriptionsWithMedicines,
    });

  } catch (error) {
    console.error("Error getting patient prescriptions:", error);
    res.status(500).json({
      error: "Error getting prescription!",
    });
  }
};


// get labreports from new module: patient
const getPatientLabReports = async (req, res) => {
  const { old_pid } = req.query;

  try {
    const connection = await isConnected(old_pid, "patient");
    if (!connection || !connection.is_connected) {
      res.status(404).json({
        error: "Patient not found!",
      });
    }

    const [labReports] = await sequelize.query(
      `SELECT * FROM tele_labreport 
       WHERE patient_id = :new_pid
       ORDER BY Date DESC`,
      {
        replacements: {
          new_pid: connection.new_entity_id,
        },
        type: QueryTypes.SELECT,
      }
    );
    res.status(200).json({
      message: "Lab reports fetched successfully!",
      data: labReports || [],
    });
  } catch (error) {
    console.error("Error getting patient lab reports:", error);
    res.status(500).json({
      error: "Error getting patient lab report",
    });
  }
};

// patients vitals
const getPatientVitals = async (req, res) => {
  const { old_pid } = req.query;
  try {
    const connection = await isConnected(old_pid, "patient");
    if (!connection || !connection.is_connected) {
      return res.status(404).json({ error: "Patient not connected" });
    }

    console.log("fetching for : ", connection.new_entity_id);
    const [vitals] = await sequelize.query(
      `SELECT v.*, a.appointment_date, d.doctor as doctor_name
       FROM tele_appointment_vitals v
       JOIN tele_appointments a ON v.appointment_id = a.id
       LEFT JOIN tele_doctor d ON a.doctor_id = d.id
       WHERE a.patient_id = :new_pid
       ORDER BY a.appointment_date DESC`,
      {
        replacements: { new_pid: connection.new_entity_id },
        type: QueryTypes.SELECT,
      }
    );
    res.status(200).json({
      message: "vitals data fetched successfully",
      data: vitals || [],
    });
  } catch (error) {
    console.error("Error getting patient vitals:", error);
    res.status(500).json({
      error: "Error getting presription!",
    });
  }
};

// Get diagnosis: patient
const getPatientDiagnosis = async (oldPatientId) => {
  try {
    const connection = await isConnected(oldPatientId, "patient");
    if (!connection || !connection.is_connected) {
      return null;
    }

    const [diagnoses] = await sequelize.query(
      `SELECT d.*, a.appointment_date, doc.doctor as doctor_name
       FROM tele_diagnosis d
       JOIN tele_appointments a ON d.appointment_id = a.id
       LEFT JOIN tele_doctor doc ON a.doctor_id = doc.id
       WHERE a.patient_id = ?
       ORDER BY a.appointment_date DESC`,
      [connection.new_entity_id]
    );
    return diagnoses;
  } catch (error) {
    console.error("Error getting patient diagnosis:", error);
    return null;
  }
};

// patient's allergies
const getPatientAllergies = async (oldPatientId) => {
  try {
    const connection = await isConnected(oldPatientId, "patient");
    if (!connection || !connection.is_connected) {
      return null;
    }

    const [allergies] = await sequelize.query(
      `SELECT a.*, p.appointment_date, d.doctor as doctor_name
       FROM tele_allergies a
       JOIN tele_appointments p ON a.appointment_id = p.id
       LEFT JOIN tele_doctor d ON p.doctor_id = d.id
       WHERE p.patient_id = ?
       ORDER BY p.appointment_date DESC`,
      [connection.new_entity_id]
    );
    return allergies;
  } catch (error) {
    console.error("Error getting patient allergies:", error);
    return null;
  }
};

// Get patient's complete medical history from new module
const getPatientMedicalHistory = async (oldPatientId) => {
  try {
    const connection = await isConnected(oldPatientId, "patient");
    if (!connection || !connection.is_connected) {
      return null;
    }

    const [medicalHistory] = await sequelize.query(
      `SELECT 
        a.appointment_date,
        d.doctor as doctor_name,
        di.diagnosis,
        m.name as medicine,
        m.dosage,
        m.frequency,
        v.height,
        v.weight,
        v.blood_pressure,
        v.temperature,
        al.medicines as allergies_medicines,
        al.food as allergies_food,
        c.complaint
       FROM tele_appointments a
       LEFT JOIN tele_doctor d ON a.doctor_id = d.id
       LEFT JOIN tele_diagnosis di ON a.id = di.appointment_id
       LEFT JOIN tele_medicines m ON a.id = m.appointment_id
       LEFT JOIN tele_appointment_vitals v ON a.id = v.appointment_id
       LEFT JOIN tele_allergies al ON a.id = al.appointment_id
       LEFT JOIN tele_complaints c ON a.id = c.appointment_id
       WHERE a.patient_id = ?
       ORDER BY a.appointment_date DESC`,
      [connection.new_entity_id]
    );
    return medicalHistory;
  } catch (error) {
    console.error("Error getting patient medical history:", error);
    return null;
  }
};

// Initialize the connection system
const initializeConnection = async () => {
  await createConnectionTable();
};

module.exports = {
  initializeConnection,
  connectDoctor,
  connectPatient,
  isConnected,
  getPatientPrescriptions,
  getPatientLabReports,
  getPatientVitals,
  getPatientDiagnosis,
  getPatientAllergies,
  getPatientMedicalHistory,
};
