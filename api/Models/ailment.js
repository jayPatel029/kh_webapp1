const { DataTypes, Sequelize } = require("sequelize");
const { sequelize } = require("../databaseConn/database");
const { Language } = require("./language");

const Ailment = sequelize.define("ailment", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  Ailment_Img: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

const AilmentTranslation = sequelize.define("ailmentTranslation", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  ailmentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Ailment,
      key: "id",
    },
  },
  languageId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Language,
      key: "id",
    },
  },
  name: {
    type: Sequelize.STRING(255),
    allowNull: false,
  },
}, {
  charset: 'utf8mb4', // Enables support for full Unicode (e.g., multi-language, emojis)
  collate: 'utf8mb4_unicode_ci', // Collation ensures proper sorting for Unicode
});


AilmentTranslation.belongsTo(Ailment, { foreignKey: "ailmentId" });
Ailment.hasMany(AilmentTranslation, { foreignKey: "ailmentId" });

const insertDialysisAilments = async () => {
  const existingAilments = await Ailment.findAll({
    where: {
      name: ["Hemo Dialysis", "Peritoneal Dialysis"],
    },
  });

  if (existingAilments.length === 0) {
    await Ailment.bulkCreate(
      [
        {
          name: "Hemo Dialysis",
          Ailment_Img:
            "https://kifaytidata2024.s3.amazonaws.com/9780_hemo dialysis.png",
        },
        {
          name: "Peritoneal Dialysis",
          Ailment_Img:
            "https://kifaytidata2024.s3.amazonaws.com/7377_peritoneal dialysis.png",
        },
      ],
      { ignoreDuplicates: true }
    );
  }
};

module.exports = { Ailment, AilmentTranslation, insertDialysisAilments };
