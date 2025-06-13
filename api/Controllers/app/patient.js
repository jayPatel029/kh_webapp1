const moment = require("moment");

const { pool } = require("../../databaseConn/database.js");
const { ailmentsDictionary } = require("./ailment_dictionary.js");

// Function to translate ailment names`
function translateAilmentNames(response, language) {
  const translatedObjects = [];
  response.forEach((entry) => {
    const translations = ailmentsDictionary[entry.name] || {};
    const translatedName = translations[`name_${language}`] || entry.name; // Get translation for the specified language
    translatedObjects.push({
      id: entry.id,
      name: entry.name,
      name_translation: translatedName,
      Ailment_Img: entry.Ailment_Img,
    });
  });
  return translatedObjects;
}

const getProfileDetails = async (req, res, next) => {
  const { userID, language } = req.body;
  try {
    const query = `SELECT * FROM patients WHERE id = ${userID};`;
    const result = await pool.query(query);
    if (result.length > 0) {
      var isAdvance =
        result[0]["program"] == "Advanced"
          ? 2
          : result[0]["program"] == "Standard"
          ? 1
          : 0;
      var ailmentsList = [];
      var alim = result[0]["aliments"].split(",");
      for (var i in alim) {
        try {
          const alimName = alim[i].trim();
          const query = `SELECT * FROM ailments WHERE name = '${alimName}'`;
          const ailment = await pool.query(query);
          const translatedObjects = translateAilmentNames(ailment, language); // Pass the language argument
          ailmentsList.push(...translatedObjects);
        } catch (err) {
          console.log("Error while fetching ailments of patient");
        }
      }
      res.status(200).json({
        result: true,
        isAdvance: isAdvance,
        message: "Successful",
        userID: result[0]["id"],
        username: result[0]["name"],
        phoneNo: result[0]["number"].toString(),
        dob: result[0]["dob"],
        address: result[0]["address"],
        pincode: result[0]["pincode"],
        state: result[0]["state"],
        image: "",
        fitBitToken: "",
        ailmentslist: ailmentsList,
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Number not found",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error while checking patient phone number",
    });
  }
};

const getAilmentList = async (req, res, next) => {
  const { phoneNo, language } = req.body;
  console.log("get all ailment list req found");
  try {
    const query = `SELECT * FROM patients WHERE number = ${phoneNo}`;
    const result = await pool.query(query);
    const query2 = `SELECT * FROM ailments`;
    const ailments = await pool.query(query2);

    if (result.length > 0) {
      // Phone number exists
      const translatedObjects = translateAilmentNames(ailments, language);
      res.status(200).json({
        success: true,
        message: "Already Registered",
        listOfAilments: translatedObjects,
      });
    } else {
      // Phone number doesn't exist
      const translatedObjects = translateAilmentNames(ailments);
      res.status(200).json({
        success: true,
        message: "Successful",
        listOfAilments: translatedObjects,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error while checking patient phone number",
    });
  }
};
const getAilmentsList = async (req, res, next) => {
  const { language } = req.body;
  console.log("get all ailmentss list req found");
  try {
    const query2 = `SELECT * FROM ailments`;
    const ailments = await pool.query(query2);
    const translatedObjects = translateAilmentNames(ailments, language);
    res.status(200).json({
      success: true,
      message: "Already Registered",
      listOfAilments: translatedObjects,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error while getting ailments",
    });
  }
};

const updateUserAilment = async (req, res, next) => {
  // const {token} = req.headers;
  const { userID, newAilments } = req.body;
  console.log("update ailment req found");
  try {
    const query = `UPDATE patients set aliments = '${newAilments}' WHERE id = ${userID}`;
    const result = await pool.query(query);
    // console.log(result);
    res.status(200).json({
      success: true,
      message: "Successful",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error while updating user ailments",
    });
  }
};

const updateToken = async (req, res, next) => {
  const { UserID, PushNotificationId } = req.body;

  const query = `UPDATE patients set push_notification_id = '${PushNotificationId}' where id = ${UserID};`;

  try {
    await pool.query(query);
    res.status(200).json({
      result: true,
      message: "Successful",
    });
  } catch (err) {
    console.log("error updating fcm: ", err);
    res.status(500).json({
      result: false,
      message: "Failed to update token",
    });
  }
};

module.exports = {
  getAilmentList,
  getProfileDetails,
  updateUserAilment,
  updateToken,
  getAilmentsList
};
