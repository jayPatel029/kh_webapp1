const router = require("express").Router();
const { pool } = require("../databaseConn/database.js");
// const { createNewEnrollmentAlert } = require("../Controllers/Alerts.js");
const axios = require("axios");

async function logChange(userId, field, patientName, number, oldValue, newValue, changedBy) {

    const query = `
        INSERT INTO patient_log (patient_id,changed_field, old_value, new_value, changed_by, patientName , number )
        VALUES (?, ?, ?, ?, ?,?,?)
    `;
    try {
        console.log("adding log for patient: ", userId);
        await pool.query(query, [userId,  field, oldValue, newValue, changedBy,patientName,number,]);
    } catch (error) {
        console.error("Error logging change:", error);
    }
}

async function ReportLog(userId,report,type,report_id,message,deletedBy)
{
    const query = `
        INSERT INTO report_log (report_id, patient_id,report, type, message, deletedBy)
        VALUES (?, ?, ?, ?, ?,?)
    `;
    try {
        await pool.query(query, [report_id,userId, report,type,message,deletedBy]);
    } catch (error) {
        console.error("Error logging change:", error);
    }
}
async function doclogChange(userId,doctorName,doctorEmail, field, oldValue, newValue, changedBy) {
    const query = `
        INSERT INTO doctor_log (doctor_id, doctorName, doctorEmail, changed_field, old_value, new_value, changed_by)
        VALUES (?, ?, ?, ?, ?,?,?)
    `;
    try {
        await pool.query(query, [userId, doctorName,doctorEmail, field, oldValue, newValue, changedBy]);
    } catch (error) {
        console.error("Error logging change:", error);
    }
}   

async function downloadLog(req, res) {
    try {
        const query = "SELECT * FROM patient_log ORDER BY changed_at DESC";
        const results = await pool.query(query);
    console.log("results", results);
        // Format data for response
        const formattedLogs = results.map((log) => ({
          patientId: log.patient_id,
            patientName: log.patientName,
            number: log.number,
          field: log.changed_field,
          oldValue: log.old_value || "null",
          newValue: log.new_value || "null",
          changedAt: log.changed_at,
          changedBy: log.changed_by,
        }));
    
        res.status(200).json({ logs: formattedLogs });
      } catch (error) {
        console.error("Error fetching logs:", error);
        res.status(500).json({ message: "Internal Server Error" });
      }
}

async function DownReportlog(req, res) {
    try {
        const query = "SELECT * FROM report_log ORDER BY changed_at DESC";
        const results = await pool.query(query);
        
       
        const formattedLogs = results.map((log) => ({
          report_id: log.report_id,
          patientId: log.patient_id,
          report: log.report,
          type: log.type,
          message: log.message,
          deletedBy: log.deletedBy,
        }));    
        res.status(200).json({ logs: formattedLogs });
        }
        catch (error) {
        console.error("Error fetching logs:", error);
        res.status(500).json({ message: "Internal Server Error" });
        }

}

async function DocdownloadLog(req, res) {
    try {
        const query = "SELECT * FROM doctor_log ORDER BY changed_at DESC";
        const results = await pool.query(query);
    console.log("results", results);
        // Format data for response
        const formattedLogs = results.map((log) => ({
          doctor_id: log.doctor_id,
          field: log.changed_field,
          doctorName:log.doctorName,
            doctorEmail:log.doctorEmail,
          oldValue: log.old_value || "null",
          newValue: log.new_value || "null",
          changedAt: log.changed_at,
          changedBy: log.changed_by,
        }));
    
        res.status(200).json({ logs: formattedLogs });
      } catch (error) {
        console.error("Error fetching logs:", error);
        res.status(500).json({ message: "Internal Server Error" });
      }
}

module.exports= {
    logChange,
    doclogChange,
    downloadLog,
    DocdownloadLog,
    DownReportlog,
    ReportLog,
};
