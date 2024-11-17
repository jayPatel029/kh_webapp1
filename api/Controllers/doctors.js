const { pool } = require("../databaseConn/database.js");
const { logChange, doclogChange } = require("./log.js");

const insertSpecialities = async (doctorId, specialities) => {
  try {
    // Check if the doctor exists

    // Insert specialities
    const insertPromises = specialities.map(async (speciality) => {
      const result = await pool.query(
        "INSERT INTO specialities (doctorid, speciality) VALUES (?, ?)",
        [doctorId, speciality.value]
      );

      return result;
    });

    const insertResults = await Promise.all(insertPromises);

    const anyInsertionSuccess = insertResults.some(
      (result) => result.affectedRows > 0
    );

    return anyInsertionSuccess;
  } catch (error) {
    console.error("Error inserting specialities:", error.message);
    return false;
  }
};

const insertDoctorDailyReadings = async (doctorId, dailyReadings) => {
  try {
    // Insert daily readings
    const insertPromises = dailyReadings.map(async (dailyReading) => {
      const result = await pool.query(
        "INSERT INTO doctor_daily_readings (doctorid, dailyreadingid, title) VALUES (?, ?, ?)",
        [doctorId, dailyReading.value, dailyReading.label]
      );

      return result;
    });

    const insertResults = await Promise.all(insertPromises);

    const anyInsertionSuccess = insertResults.some(
      (result) => result.affectedRows > 0
    );

    return anyInsertionSuccess;
  } catch (error) {
    console.error("Error inserting daily readings:", error.message);
    return false;
  }
};

const insertDoctorDialysisReadings = async (doctorId, dialysisReadings) => {
  try {
    // Insert dialysis readings
    const insertPromises = dialysisReadings.map(async (dialysisReading) => {
      const result = await pool.query(
        "INSERT INTO doctor_dialysis_readings (doctorid, dialysisreadingid, title) VALUES (?, ?, ?)",
        [doctorId, dialysisReading.value, dialysisReading.label]
      );

      return result;
    });

    const insertResults = await Promise.all(insertPromises);

    const anyInsertionSuccess = insertResults.some(
      (result) => result.affectedRows > 0
    );

    return anyInsertionSuccess;
  } catch (error) {
    console.error("Error inserting dialysis readings:", error.message);
    return false;
  }
};

const createDoctor = async (req, res, next) => {
  try {
    const {
      name,
      role,
      email,
      licenseNo,
      practicingAt,
      experience,
      ref,
      resume,
      phoneno,
      doctorsCode,
      institute,
      address,
      photo,
      description,
      specialities,
      email_notification,
      can_export,
      dialysis_updates,
      dailyReadingsAlerts,
    } = req.body;
    let dailyReadings = [];
    let dialysisReadings = [];
    if (role === "Doctor") {
      dailyReadings = req.body.dailyReadings;
      dialysisReadings = req.body.dialysisReadings;
    }

    const doctor = {
      name: name,
      role: role,
      email: email,
      license_no: licenseNo,
      practicing_at: practicingAt,
      experience: experience,
      ref: ref,
      resume: resume,
      phoneno: phoneno,
      doctors_code: doctorsCode,
      institute: institute,
      address: address,
      photo: photo,
      description: description,
      email_notification: email_notification,
      can_export: can_export,
      dialysis_updates: dialysis_updates,
      dailyReadingsAlerts: dailyReadingsAlerts,
      regdate: new Date().toISOString().slice(0, 19).replace("T", " "),
    };

    const isDoctor = await pool.query(`SELECT * FROM doctors WHERE email = ?`, [
      doctor.email,
    ]);

    if (isDoctor.length > 0) {
      res.status(400).json({
        success: false,
        message: "User already exists",
      });
    } else {
      const query =
        "INSERT INTO doctors ( name,   role,   email,   `license no`,  `practicing at`,  experience,   ref,   resume,  phoneno,`doctors code`,institute,address,photo,description, email_notification, can_export,Dialysis_updates,daily_update, regdate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?, ?);";

      const result = await pool.query(query, [
        doctor.name,
        doctor.role,
        doctor.email,
        doctor.license_no,
        doctor.practicing_at,
        doctor.experience,
        doctor.ref,
        doctor.resume,
        doctor.phoneno,
        doctor.doctors_code,
        doctor.institute,
        doctor.address,
        doctor.photo,
        doctor.description,
        doctor.email_notification,
        doctor.can_export,
        doctor.dialysis_updates,
        doctor.dailyReadingsAlerts,
        doctor.regdate,
      ]);

      const user = {
        firstname: doctor.name,
        lastname: "",
        email: doctor.email,
        user_password: null,
        role_name: doctor.role,
        phoneno: doctor.phoneno,
        regdate: new Date().toISOString().slice(0, 19).replace("T", " "),
      };
      const isuser = await pool.query(
        `SELECT * FROM users WHERE email = '${user.email}'`
      );
      if (isuser.length <= 0) {
        const query2 = `INSERT INTO users (firstname,lastname,email,user_password,role,phoneno,regdate) VALUES('${user.firstname}','${user.lastname}','${user.email}','${user.user_password}','${user.role_name}','${user.phoneno}','${user.regdate}')`;
        const result2 = await pool.query(query2);
      }

      if (result.affectedRows > 0) {
        const insertedId = result.insertId;
        const specialitiesRes = await insertSpecialities(
          insertedId,
          specialities
        );
        const dailyRes = await insertDoctorDailyReadings(
          insertedId,
          dailyReadings
        );
        const dialysisRes = await insertDoctorDialysisReadings(
          insertedId,
          dialysisReadings
        );
        if (specialitiesRes) {
          res.status(200).json({
            success: true,
            message: "Doctor Created Successfully",
            doctorId: parseInt(insertedId),
          });
        } else {
          res.status(200).json({
            success: true,
            message: "Doctor Created Successfully, Specialities unsuccessful",
            doctorId: parseInt(insertedId),
          });
        }
      } else {
        res.status(400).json({
          success: false,
          message: "Something went wrong",
        });
      }
    }
  } catch (error) {
    console.error("Error creating doctor:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const getDoctors = async (req, res, next) => {
  try {
    const query = `SELECT * FROM doctors`;
    const doctors = await pool.query(query);

    // Fetch specialities for each doctor
    const doctorsWithSpecialities = await Promise.all(
      doctors.map(async (doctor) => {
        const specialitiesQuery = `SELECT speciality FROM specialities WHERE doctorid = ?`;
        const specialities = await pool.query(specialitiesQuery, [doctor.id]);
        const dailyQuery = `SELECT dailyreadingid,	title FROM doctor_daily_readings WHERE doctorid = ?`;
        const dailyReadings = await pool.query(dailyQuery, [doctor.id]);
        const dialysisQuery = `SELECT dialysisreadingid,	title FROM doctor_dialysis_readings WHERE doctorid = ?`;
        const dialysisReadings = await pool.query(dialysisQuery, [doctor.id]);
        return {
          ...doctor,
          specialities: specialities.map((sp) => {
            return { value: sp.speciality, label: sp.speciality };
          }),
          dailyReadings: dailyReadings.map((sp) => {
            return { value: sp.dailyreadingid, label: sp.title };
          }),
          dialysisReadings: dialysisReadings.map((sp) => {
            return { value: sp.dialysisreadingid, label: sp.title };
          }),
        };
      })
    );

    res.status(200).json({
      success: true,
      data: doctorsWithSpecialities,
    });
  } catch (error) {
    console.error("Error getting doctors:", error.message);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};

const getDoctorsForChat = async (req, res, next) => {
  try {
    const patientId = req.params.pid;

    const query = ` 
    SELECT d.*
    FROM doctors d
    JOIN doctor_patients dp ON d.id = dp.doctor_id
    WHERE dp.patient_id = ${patientId};`;
    const doctors = await pool.query(query);



    // Fetch specialities for each doctor
    const doctorsWithSpecialities = await Promise.all(
      doctors.map(async (doctor) => {
        const specialitiesQuery = `SELECT speciality FROM specialities WHERE doctorid = ?`;
        const specialities = await pool.query(specialitiesQuery, [doctor.id]);
        const dailyQuery = `SELECT dailyreadingid,	title FROM doctor_daily_readings WHERE doctorid = ?`;
        const dailyReadings = await pool.query(dailyQuery, [doctor.id]);
        const dialysisQuery = `SELECT dialysisreadingid,	title FROM doctor_dialysis_readings WHERE doctorid = ?`;
        const dialysisReadings = await pool.query(dialysisQuery, [doctor.id]);
        return {
          ...doctor,
          specialities: specialities.map((sp) => {
            return { value: sp.speciality, label: sp.speciality };
          }),
          dailyReadings: dailyReadings.map((sp) => {
            return { value: sp.dailyreadingid, label: sp.title };
          }),
          dialysisReadings: dialysisReadings.map((sp) => {
            return { value: sp.dialysisreadingid, label: sp.title };
          }),
        };
      })
    );

    res.status(200).json({
      success: true,
      data: doctorsWithSpecialities,
    });
  } catch (error) {
    console.error("Error getting doctors:", error.message);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};


const updateDoctor = async (req, res, next) => {
  try {
    const {
      name,
      role,
      email,
      licenseNo,
      practicingAt,
      experience,
      ref,
      resume,
      phoneno,
      doctorsCode,
      institute,
      address,
      photo,
      description,
      specialities,
      email_notification,
      Dialysis_updates,
      can_export,
      dailyReadingsAlerts,
    } = req.body;
    const {changeby}=req.body;
    const {doctorid}=req.body;
    let dailyReadings = [];
    let dialysisReadings = [];
    if (role === "Doctor") {
      dailyReadings = req.body.dailyReadings;
      dialysisReadings = req.body.dialysisReadings;
    }

    const doctor = {
      name: name,
      role: role,
      email: email,
      license_no: licenseNo,
      practicing_at: practicingAt,
      experience: experience,
      ref: ref,
      resume: resume,
      phoneno: phoneno,
      doctors_code: doctorsCode,
      institute: institute,
      address: address,
      photo: photo,
      description: description,
      email_notification: email_notification,
      Dialysis_updates: Dialysis_updates,
      dailyReadingsAlerts: dailyReadingsAlerts,
      can_export: can_export,
    };

    const doctor_old_details = await pool.query(
      `SELECT * FROM doctors WHERE id = ?`,
      [req.params.id]
    );

    const formattedOldDoctor = {
      name: doctor_old_details[0].name,
      role: doctor_old_details[0].role,
      email: doctor_old_details[0].email,
      license_no: doctor_old_details[0]["license no"],
      practicing_at: doctor_old_details[0]["practicing at"],
      experience: doctor_old_details[0].experience,
      ref: doctor_old_details[0].ref,
      resume: doctor_old_details[0].resume,
      phoneno: doctor_old_details[0].phoneno,
      doctors_code: doctor_old_details[0]["doctors code"],
      institute: doctor_old_details[0].institute,
      address: doctor_old_details[0].address,
      photo: doctor_old_details[0].photo,
      description: doctor_old_details[0].description,
      email_notification: doctor_old_details[0].email_notification,
      Dialysis_updates: doctor_old_details[0].Dialysis_updates,
      dailyReadingsAlerts: doctor_old_details[0].daily_update, // Match the key to `dailyReadingsAlerts`
      can_export: doctor_old_details[0].can_export,
    };
    
    // Compare the two objects and log changes
    const changedFields = Object.keys(doctor).filter((key) => {
      const oldValue = formattedOldDoctor[key];
      const newValue = doctor[key];
    
      // Normalize null/undefined and date comparisons
      if (oldValue == null && (newValue == null )) return false;
      if (oldValue instanceof Date && newValue instanceof Date) {
        return oldValue.getTime() !== newValue.getTime();
      }
    
      return oldValue !== newValue;
    });
    
    console.log("Changed fields:", changedFields);
    changedFields.forEach((field) => {
      doclogChange(doctorid ,name, email, field, formattedOldDoctor[field], doctor[field], changeby);
      console.log(`Field: ${field}, Old Value: ${formattedOldDoctor[field]}, New Value: ${doctor[field]}`);
    });
    const query =
      "UPDATE doctors SET name = ?, role = ?, email = ?, `license no` = ?, `practicing at` = ?, experience = ?, ref = ?, resume = ?, phoneno = ?, `doctors code` = ?, institute = ?, address = ?, photo = ?, email_notification = ?, can_export=?, description = ?, Dialysis_updates=?, daily_update=? WHERE id = ?";

    const result = await pool.query(query, [
      doctor.name,
      doctor.role,
      doctor.email,
      doctor.license_no,
      doctor.practicing_at,
      doctor.experience,
      doctor.ref,
      doctor.resume || doctor_old_details[0].resume,
      doctor.phoneno,
      doctor.doctors_code,
      doctor.institute,
      doctor.address,
      doctor.photo || doctor_old_details[0].photo,
      doctor.email_notification,
      doctor.can_export,
      doctor.description,
      doctor.Dialysis_updates,
      doctor.dailyReadingsAlerts,
      req.params.id,
    ]);
    if (result.affectedRows > 0) {
      // Delete all specialties belonging to the given doctor
      await pool.query("DELETE FROM specialities WHERE doctorid = ?", [
        req.params.id,
      ]);

      // Re-insert the updated specialties
      await insertSpecialities(req.params.id, specialities);

      await pool.query("DELETE FROM doctor_daily_readings WHERE doctorid = ?", [
        req.params.id,
      ]);

      // Re-insert the updated specialties
      await insertDoctorDailyReadings(req.params.id, dailyReadings);

      await pool.query(
        "DELETE FROM doctor_dialysis_readings WHERE doctorid = ?",
        [req.params.id]
      );

      // Re-insert the updated specialties
      await insertDoctorDialysisReadings(req.params.id, dialysisReadings);

      const userQuery = `UPDATE users SET firstname = ?, role = ?, phoneno = ?, email = ? WHERE email = ?`;
      await pool.query(userQuery, [
        doctor.name,
        doctor.role,
        doctor.phoneno,
        doctor.email,
        doctor_old_details[0].email,
      ]);

      res.status(200).json({
        success: true,
        message: "Doctor updated successfully",
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Something went wrong",
      });
    }
  } catch (error) {
    console.error("Error updating doctor:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const deleteDoctor = async (req, res, next) => {
  try {
    // Delete all specialties belonging to the given doctor
    await pool.query("DELETE FROM specialities WHERE doctorid = ?", [
      req.params.id,
    ]);
    await pool.query("DELETE FROM doctor_daily_readings WHERE doctorid = ?", [
      req.params.id,
    ]);
    await pool.query(
      "DELETE FROM doctor_dialysis_readings WHERE doctorid = ?",
      [req.params.id]
    );

    const doctorEmail = await pool.query(
      "Select email from doctors where id = ?",
      [req.params.id]
    );

    const result = await pool.query("DELETE FROM doctors WHERE id = ?", [
      req.params.id,
    ]);

    await pool.query("DELETE FROM users WHERE email = ?", [
      doctorEmail[0].email,
    ]);
    console.log("result", doctorEmail[0].email);

    if (result.affectedRows > 0) {
      res.status(200).json({
        success: true,
        message: "Doctor deleted successfully",
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Doctor not found",
      });
    }
  } catch (error) {
    console.error("Error deleting doctor:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const getDoctorNamebyId = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `SELECT name FROM doctors WHERE id = ?`;
    const response = await pool.query(query, [id]);
    const doctorName = response[0].name;
    res.status(200).json({
      success: true,
      data: doctorName,
    });
  } catch (error) {
    console.error("Error getting doctor name by id:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const getDoctorIdbyEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const query = `SELECT id FROM doctors WHERE email = ?`;
    const response = await pool.query(query, [email]);
    const doctorId = response[0].id;
    res.status(200).json({
      success: true,
      data: doctorId,
    });
  } catch (error) {
    console.error("Error getting doctor id by email:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  createDoctor,
  getDoctors,
  updateDoctor,
  deleteDoctor,
  getDoctorNamebyId,
  getDoctorIdbyEmail,
  getDoctorsForChat
};
