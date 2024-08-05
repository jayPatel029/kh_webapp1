const pool = require("../databaseConn/database.js").pool;
const {
  DailyReadings,
  DialysisReadings,
  DailyReadingsTranslations,
  DialysisReadingsTranslations,
  DailyReadingAilments,
  DialysisReadingAilments,
} = require("../Models/readings.js");
const { Ailment } = require("../Models/ailment.js");

async function getDailyReadings(req, res) {
  try {
    const result = await DailyReadings.findAll({
      where: {
        showUser: 0  // Filter condition to ensure showUser is zero
      },
      include: [
        {
          model: DailyReadingsTranslations,
        },
        {
          model: DailyReadingAilments,
          include: [
            {
              model: Ailment,
            },
          ],
        },
      ],
    });

    const filtered_result = result.map((reading) => {
      const ailments = reading.daily_reading_ailments.map((ailment) => {
        return { name: ailment.ailment.name, id: ailment.ailment.id };
      });
      delete reading.dataValues.daily_reading_ailments;
      return {
        ...reading.dataValues,
        ailments,
      };
    });
    res.json(filtered_result);
  } catch (error) {
    console.error("Error fetching daily readings:", error);
    res.status(500).send("Internal Server Error");
  }
}

async function getDailyReadingsTranslations(req, res) {
  try {
    // Fetch all records from the
    const readings = await DailyReadings.findAll();
    const translations = await readings.map(async (reading) => {
      const translation = await DailyReadingsTranslations.findAll({
        where: {
          dr_id: reading.id,
        },
      });
      return { ...readings, translations: translation };
    });
    res.json(translations);
  } catch (error) {
    console.error("Error fetching daily readings translations:", error);
    res.status(500).send("Internal Server Error");
  }
}

async function addDailyReading(req, res) {
  try {
    const {
      title,
      ailments,
      type,
      assign_range,
      low_range,
      high_range,
      isGraph,
      alertTextDoc,
      readingsTranslations,
    } = req.body;

    console.log(title, type, assign_range, low_range, high_range,isGraph, alertTextDoc, readingsTranslations)

    console.log("ailments",ailments);

    // Insert a new record into the daily_readings table
    const newReading = await DailyReadings.create({
      title,
      type,
      assign_range,
      low_range,
      high_range,
      isGraph,
      alertTextDoc,
    });

    const ailmentsInserted = await ailments.map(async (ailment) => {
      await DailyReadingAilments.create({
        dr_id: newReading.id,
        ailmentID: ailment,
      });
    });
    // Insert translations for the new reading
    const translations = Object.entries(readingsTranslations).map(
      ([language, translation]) => ({
        dr_id: newReading.id,
        language_id: parseInt(language),
        title: translation,
      })
    );
    await DailyReadingsTranslations.bulkCreate(translations);

    res.status(201).send("Daily reading added successfully");
  } catch (error) {
    console.error("Error adding daily reading:", error);
    res.status(500).send("Internal Server Error");
  }
}

async function deleteDailyReading(req, res) {
  try {
    const id = req.params.id;

    // Delete a specific daily reading from the database
    await DailyReadingsTranslations.destroy({
      where: {
        dr_id: id,
      },
    });
    await DailyReadingAilments.destroy({
      where: {
        dr_id: id,
      },
    });
    await DailyReadings.destroy({
      where: {
        id: id,
      },
    });

    res.status(200).send("Daily reading deleted successfully");
  } catch (error) {
    console.error("Error deleting daily reading:", error);
    res.status(500).send("Internal Server Error");
  }
}

async function updateDailyReading(req, res) {
  try {
    const {
      id,
      title,
      ailments,
      type,
      assign_range,
      low_range,
      high_range,
      isGraph,
      alertTextDoc,
      readingsTranslations,
    } = req.body;

    // Update the daily reading with the new values
    await DailyReadings.update(
      {
        title,
        type,
        assign_range,
        low_range,
        high_range,
        isGraph,
        alertTextDoc,
      },
      {
        where: { id },
      }
    );
    await DailyReadingAilments.destroy({
      where: {
        dr_id: id,
      },
    });
    const ailmentsInserted = await ailments.map(async (ailment) => {
      await DailyReadingAilments.create({
        dr_id: id,
        ailmentID: ailment,
      });
    });
    await DailyReadingsTranslations.destroy({
      where: {
        dr_id: id,
      },
    });
    // Insert translations for the new reading
    if (readingsTranslations !== undefined) {
      const translations = Object.entries(readingsTranslations).map(
        ([language, translation]) => ({
          dr_id: id,
          language_id: parseInt(language),
          title: translation,
        })
      );
      await DailyReadingsTranslations.bulkCreate(translations);
    }

    res.status(200).send("Daily reading updated successfully");
  } catch (error) {
    console.error("Error updating daily reading:", error);
    res.status(500).send("Internal Server Error");
  }
}

/*
==================================================================================
Dialysis Section
=============================================================================================
*/

async function getDialysisReadings(req, res) {
  try {
    const result = await DialysisReadings.findAll({
      where: {
        showUser: 0  // Filter condition to ensure showUser is zero
      },
      include: [
        {
          model: DialysisReadingsTranslations,
        },
        {
          model: DialysisReadingAilments,
          include: [
            {
              model: Ailment,
            },
          ],
        },
      ],
    });

    const filtered_result = result.map((reading) => {
      const ailments = reading.dialysis_reading_ailments.map((ailment) => {
        return { name: ailment.ailment.name, id: ailment.ailment.id };
      });
      delete reading.dataValues.dialysis_reading_ailments;
      return {
        ...reading.dataValues,
        ailments,
      };
    });
    res.json(filtered_result);
  } catch (error) {
    console.error("Error fetching daily readings:", error);
    res.status(500).send("Internal Server Error");
  }
}

async function getDialysisReadingsTranslations(req, res) {
  try {
    // Fetch all records from the
    const readings = await DialysisReadings.findAll();
    const translations = await readings.map(async (reading) => {
      const translation = await DialysisReadingsTranslations.findAll({
        where: {
          dr_id: reading.id,
        },
      });
      return { ...readings, translations: translation };
    });
    res.json(translations);
  } catch (error) {
    console.error("Error fetching Dialysis readings translations:", error);
    res.status(500).send("Internal Server Error");
  }
}

async function addDialysisReading(req, res) {
  try {
    const {
      title,
      ailments,
      type,
      assign_range,
      low_range,
      high_range,
      isGraph,
      alertTextDoc,
      readingsTranslations,
    } = req.body;

    console.log("ailments",ailments);

    // Insert a new record into the Dialysis_readings table
    const newReading = await DialysisReadings.create({
      title,
      type,
      assign_range,
      low_range,
      high_range,
      isGraph,
      alertTextDoc,
    });

    const ailmentsInserted = await ailments.map(async (ailment) => {
      await DialysisReadingAilments.create({
        dr_id: newReading.id,
        ailmentID: ailment,
      });
    });
    // Insert translations for the new reading
    const translations = Object.entries(readingsTranslations).map(
      ([language, translation]) => ({
        dr_id: newReading.id,
        language_id: parseInt(language),
        title: translation,
      })
    );
    await DialysisReadingsTranslations.bulkCreate(translations);

    res.status(201).send("Dialysis reading added successfully");
  } catch (error) {
    console.error("Error adding Dialysis reading:", error);
    res.status(500).send("Internal Server Error");
  }
}

async function deleteDialysisReading(req, res) {
  try {
    const id = req.params.id;

    // Delete a specific Dialysis reading from the database
    await DialysisReadingsTranslations.destroy({
      where: {
        dr_id: id,
      },
    });
    await DialysisReadingAilments.destroy({
      where: {
        dr_id: id,
      },
    });
    await DialysisReadings.destroy({
      where: {
        id: id,
      },
    });

    res.status(200).send("Dialysis reading deleted successfully");
  } catch (error) {
    console.error("Error deleting Dialysis reading:", error);
    res.status(500).send("Internal Server Error");
  }
}

async function updateDialysisReading(req, res) {
  try {
    const {
      id,
      title,
      ailments,
      type,
      assign_range,
      low_range,
      high_range,
      isGraph,
      alertTextDoc,
      readingsTranslations,
    } = req.body;

    console.log(type, assign_range, low_range, high_range, isGraph, alertTextDoc, readingsTranslations)

    // Update the Dialysis reading with the new values
    await DialysisReadings.update(
      {
        title,
        type,
        assign_range,
        low_range,
        high_range,
        isGraph,
        alertTextDoc,
      },
      {
        where: { id },
      }
    );
    await DialysisReadingAilments.destroy({
      where: {
        dr_id: id,
      },
    });
    const ailmentsInserted = await ailments.map(async (ailment) => {
      await DialysisReadingAilments.create({
        dr_id: id,
        ailmentID: ailment,
      });
    });
    await DialysisReadingsTranslations.destroy({
      where: {
        dr_id: id,
      },
    });
    // Insert translations for the new reading
    if (readingsTranslations !== undefined) {
      const translations = Object.entries(readingsTranslations).map(
        ([language, translation]) => ({
          dr_id: id,
          language_id: parseInt(language),
          title: translation,
        })
      );
      await DialysisReadingsTranslations.bulkCreate(translations);
    }

    res.status(200).send("Dialysis reading updated successfully");
  } catch (error) {
    console.error("Error updating Dialysis reading:", error);
    res.status(500).send("Internal Server Error");
  }
}

// End of Dialysis Section

async function modifyDailyReadingRange(req, res) {
  try {
    const { id, lower_assign_range, upper_assign_range } = req.body;

    // Update the lower and upper reading of a specific daily reading
    await pool.query(
      "UPDATE daily_readings SET lower_assign_range = ?, upper_assign_range = ? WHERE id = ?",
      [lower_assign_range, upper_assign_range, id]
    );

    res.status(200).send("Daily reading range modified successfully");
  } catch (error) {
    console.error("Error modifying daily reading range:", error);
    res.status(500).send("Internal Server Error");
  }
}

async function modifyDialysisReadingRange(req, res) {
  try {
    const { id, lower_assign_range, upper_assign_range } = req.body;

    // Update the lower and upper reading of a specific daily reading
    await pool.query(
      "UPDATE dialysis_readings SET lower_assign_range = ?, upper_assign_range = ? WHERE id = ?",
      [lower_assign_range, upper_assign_range, id]
    );

    res.status(200).send("Dialysis reading range modified successfully");
  } catch (error) {
    console.error("Error modifying dialysis reading range:", error);
    res.status(500).send("Internal Server Error");
  }
}

async function postBulkDailyReadings(req, res) {
  try {
    const data = req.body;

    // Iterate through each row of data and insert into the database
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row.length === 0 || row.every((value) => value === "")) continue; // Skip empty row

      console.log(row);

      // Extract values from the row
      const [
        title,
        ailmentID,
        assign_range,
        low_range,
        high_range,
        isGraph,
        showUser,
        unit,
      ] = row;

      // Insert the row into the database
      await DailyReadings.create({
        title,
        ailmentID: ailmentID,
        assign_range: assign_range === "" ? null : assign_range,
        low_range: low_range === "" ? null : low_range,
        high_range: high_range === "" ? null : high_range,
        isGraph,
        showUser,
        unit: unit === "" ? null : unit,
      });
    }

    res.status(200).send("Data inserted successfully");
  } catch (error) {
    console.error("Error inserting data:", error);
    res.status(500).send("Internal Server Error");
  }
}

async function getAllUserReadingsByPid(req, res) {
  try {
    const pid = req.params.pid;
    const dailyResult = await DailyReadings.findAll({
      where: {
        showUser: pid,
      },
      include: [
        {
          model: DailyReadingsTranslations,
        },
        {
          model: DailyReadingAilments,
          include: [
            {
              model: Ailment,
            },
          ],
        },
      ],
    });
    const dialysisResult = await DialysisReadings.findAll({
      where: {
        showUser: pid,
        
      },
      include: [
        {
          model: DialysisReadingsTranslations,
        },
        {
          model: DialysisReadingAilments,
          include: [
            {
              model: Ailment,
            },
          ],
        },
      ],
    });
    res.json({ daily: dailyResult, dialysis: dialysisResult });
  } catch (error) {
    console.error("Error fetching user readings:", error);
    res.status(500).send("Internal Server Error");
  }
}

module.exports = {
  getDailyReadings,
  addDailyReading,
  getDialysisReadings,
  addDialysisReading,
  modifyDailyReadingRange,
  modifyDialysisReadingRange,
  postBulkDailyReadings,
  deleteDailyReading,
  deleteDialysisReading,
  updateDailyReading,
  updateDialysisReading,
  getAllUserReadingsByPid,
};
