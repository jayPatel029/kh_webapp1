const { pool } = require("../databaseConn/database.js");
const { Language } = require("../Models/language.js");

// Insert a new language
const insertLanguage = async (req, res) => {
  try {
    const { language_name, language_json, language_audio } = req.body;

    let language_json_loc = null;
    let language_audio_loc = null;

    if (language_json) {
      language_json_loc = uploadFileToS3(
        "kifaytidata2024",
        language_name + "_json" + Math.floor(Math.random() * 100000),
        language_json
      );
    }

    if (language_audio) {
      resumeLocation = uploadFileToS3(
        "kifaytidata2024",
        language_name + "_audio" + Math.floor(Math.random() * 100000),
        language_audio
      );
    }

    const result = await Language.create({ language_name , language_json: language_json_loc, language_audio: language_audio_loc});
    res.status(201).json({ message: "Language inserted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

// Delete a language by id
const deleteLanguage = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Language.destroy({ where: { id } });
    if (result === 0) {
      res.status(404).json({ error: "Language not found" });
    } else {
      res.status(200).json({ message: "Language deleted successfully" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update a language by id
const updateLanguage = async (req, res) => {
  try {
    const { id } = req.params;
    const { language_name } = req.body;
    const result = await Language.update({ language_name }, { where: { id } });
    if (result[0] === 0) {
      res.status(404).json({ error: "Language not found" });
    } else {
      res.status(200).json({ message: "Language updated successfully" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all languages
const getAllLanguages = async (req, res) => {
  try {
    const result = await Language.findAll();
    // console.log("fetching langs: ",result);
    res.status(200).json(result);
  } catch (error) {
    console.log("error in langs",error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getAllLanguages,
  updateLanguage,
  deleteLanguage,
  insertLanguage,
};
