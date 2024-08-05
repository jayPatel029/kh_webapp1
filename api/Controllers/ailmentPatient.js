const { pool } = require("../databaseConn/database.js");

const fetchAilmentId = async (req, res) => {
  const patient_id = req.params.id;

  try {
    const queryResult = await pool.query(
      "SELECT ailment_id FROM ailment_patient WHERE patient_id = ?",
      [patient_id]
    );

    if (queryResult.length > 0) {
      const ailmentIds = queryResult.map((row) => row.ailment_id);
      return res.status(200).json({ success: true, ailment_ids: ailmentIds });
    } else {
      return res.status(404).json({
        success: false,
        message: "No ailment IDs found for the user",
      });
    }
  } catch (error) {
    console.error("Error fetching ailment IDs:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

module.exports = { fetchAilmentId };
