const { pool } = require("../databaseConn/database.js");
const { Ailment, AilmentTranslation } = require("../Models/ailment.js");
const { Language } = require("../Models/language.js");

const getAilmentsByLanguage = async (req, res, next) => {
  try {
    const lang = req.params.lang;
    if (!lang || lang.toLowerCase() === "english") {
      const ailments = await Ailment.findAll({
        attributes: ["id", "name"],
      });
      res.status(200).json({
        success: true,
        listOfAilments: ailments,
      });
    } else {
      const languageid = await Language.findOne({
        attributes: ["id"],
        where: {
          language_name: lang,
        },
      });
      const ailments = await Ailment.findAll({
        attributes: ["id"],
        include: [
          {
            model: AilmentTranslation,
            attributes: ["name"],
            where: {
              languageId: languageid.id,
            },
            raw: true, // Fetch raw data without wrapping
          },
        ],
      });

      const listOfAilments = ailments.map((ailment) => {
        return {
          id: ailment.id,
          name: ailment.AilmentTranslations[0].name,
        };
      });

      res.status(200).json({
        success: true,
        listOfAilments: listOfAilments,
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
    console.log(error);
  }
};

const getAilments = async (req, res, next) => {
  try {
    const ailments = await Ailment.findAll({
      attributes: ["id", "name", "Ailment_Img"],
      include: [
        {
          model: AilmentTranslation,
        },
      ],
    });
    res.status(200).json({
      success: true,
      listOfAilments: ailments,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const getAilmentbyName = async (req, res, next) => {
  const name = req.params.name;
  try {
    const ailment = await Ailment.findOne({
      where: {
        name: name,
      },
    });
    res.status(200).json({
      success: true,
      data: ailment,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const addAilment = async (req, res, next) => {
  const { id, name, translations, Ailment_Img } = req.body;
  const q1 = Ailment.findOne({
    where: {
      name: name,
    },
  });
  if (q1.length > 0) {
    res.status(400).json({
      success: false,
      message: "Ailment already exists",
    });
  } else {
    const ailment = {
      name: name,
      Ailment_Img: Ailment_Img,
    };

    const ailmentRes = await Ailment.create(ailment);

    const AilmentTranslationObj = Object.entries(translations).map(
      ([language, translation]) => ({
        ailmentId: ailmentRes.id,
        languageId: parseInt(language),
        name: translation,
      })
    );
    await AilmentTranslation.bulkCreate(AilmentTranslationObj);

    if (ailmentRes) {
      res.status(200).json({
        success: true,
        message: "Ailment added successfully",
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Something went wrong",
      });
    }
  }
};

const deleteAilment = async (req, res, next) => {
  try {
    const id = req.params.id;
    await AilmentTranslation.destroy({
      where: {
        ailmentId: id,
      },
    });
    const result = await Ailment.destroy({
      where: {
        id: id,
      },
    });

    if (result) {
      res.status(200).json({
        success: true,
        message: "Ailment deleted successfully",
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Something went wrong",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
    console.log(error);
  }
};

const updateAilment = async (req, res, next) => {
  const id = req.params.id;
  const { name, translations, Ailment_Img } = req.body;
  let ailment;
  if (Ailment_Img) {
    ailment = {
      name: name,
      Ailment_Img: Ailment_Img,
    };
  } else {
    ailment = {
      name: name,
    };
  }

  const q1 = await Ailment.update(ailment, {
    where: {
      id: id,
    },
  });

  await AilmentTranslation.destroy({
    where: {
      ailmentId: id,
    },
  });

  const AilmentTranslationObj = Object.entries(translations).map(
    ([language, translation]) => ({
      ailmentId: id,
      languageId: parseInt(language),
      name: translation,
    })
  );
  await AilmentTranslation.bulkCreate(AilmentTranslationObj);

  if (q1) {
    res.status(200).json({
      success: true,
      message: "Ailment updated successfully",
    });
  } else {
    res.status(400).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

module.exports = {
  getAilments,
  getAilmentbyName,
  addAilment,
  deleteAilment,
  updateAilment,
  getAilmentsByLanguage,
};
