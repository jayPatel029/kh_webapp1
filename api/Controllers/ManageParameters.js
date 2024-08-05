const {
  DailyReadings,
  DialysisReadings,
  DailyReadingsTranslations,
  DialysisReadingsTranslations,
  DailyReadingAilments,
  DialysisReadingAilments,
} = require("../Models/readings.js");

async function addReading(req, res) {
  try {
    const {
      id,
      title,
      parameterType,
      assign_range,
      low_range,
      type,
      high_range,
      isGraph,
      ailmentID,
      readingsTranslations,
      ailments
    } = req.body;
    console.log(
      id,
      title,
      parameterType,
      assign_range,
      low_range,
      type,
      high_range,
      isGraph,
      ailmentID,
      readingsTranslations,
      ailments
    );

    if (parameterType === "General") {
      try {
        // Insert a new record into the daily_readings table
        const newReading = await DailyReadings.create({
          title,
          ailmentID,
          type,
          assign_range,
          low_range,
          high_range,
          isGraph,
          showUser : id,
        });

        const ailmentsInserted = await ailments.map(async (ailment) => {
          await DailyReadingAilments.create({
            dr_id: newReading.id,
            ailmentID: ailment,
          });
        });
        
        // Insert translations for the new reading
        if (readingsTranslations) {
          const translations = Object.entries(readingsTranslations).map(
            ([language, translation]) => ({
              dr_id: newReading.id,
              language_id: parseInt(language),
              title: translation,
            })
          );
          await DailyReadingsTranslations.bulkCreate(translations);
        }
        res.status(201).send("Daily reading added successfully");
      } catch (error) {
        console.error("Error adding daily reading:", error);
        res.status(500).send("Internal Server Error");
      }
    } else if (parameterType === "Dialysis") {
      try {
        // Insert a new record into the Dialysis_readings table
        const newReading = await DialysisReadings.create({
          title,
          ailmentID,
          type:type,
          assign_range,
          low_range,
          high_range,
          isGraph,
          showUser : id,
        });

        const ailmentsInserted = await ailments.map(async (ailment) => {
          await DialysisReadingAilments.create({
            dr_id: newReading.id,
            ailmentID: ailment,
          });
        });
        // Insert translations for the new reading
        if (readingsTranslations) {
          const translations = Object.entries(readingsTranslations).map(
            ([language, translation]) => ({
              dr_id: newReading.id,
              language_id: parseInt(language),
              title: translation,
            })
          );
          await DialysisReadingsTranslations.bulkCreate(translations);
        }

        res.status(201).send("Dialysis reading added successfully");
      } catch (error) {
        console.error("Error adding Dialysis reading:", error);
        res.status(500).send("Internal Server Error");
      }
    } else {
      return res.status(400).send("Invalid parameter type");
    }
  } catch (error) {
    console.error("failed", error);
    res.status(500).send("Internal Server Error");
  }
}

module.exports = {
  addReading,
};
