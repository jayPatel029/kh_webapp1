const router = require("express").Router();
const { pool } = require("../databaseConn/database.js");
// const { createNewEnrollmentAlert } = require("../Controllers/Alerts.js");
const axios = require("axios");

async function logChange(userId, field, oldValue, newValue, changedBy) {
    const query = `
        INSERT INTO patient_log (patient_id, changed_field, old_value, new_value, changed_by)
        VALUES (?, ?, ?, ?, ?)
    `;
    try {
        await pool.query(query, [userId, field, oldValue, newValue, changedBy]);
    } catch (error) {
        console.error("Error logging change:", error);
    }
}

module.exports= {
    logChange
};