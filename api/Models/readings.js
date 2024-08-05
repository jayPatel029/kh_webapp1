const { DataTypes } = require("sequelize");
const { sequelize } = require("../databaseConn/database");
const { Ailment } = require("./ailment");
const { Language } = require("./language");

const DailyReadings = sequelize.define("daily_readings", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    collate: "utf8mb4_general_ci",
  },
  assign_range: {
    type: DataTypes.ENUM("yes", "no"),
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  low_range: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  high_range: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  isGraph: {
    type: DataTypes.INTEGER(5),
    allowNull: true,
  },
  showUser: {
    type: DataTypes.INTEGER(5),
    allowNull: true,
    defaultValue: 0,
  },
  unit: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: "",
  },
  priority_type: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  alertTextDoc: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: "",
  }
});

const DialysisReadings = sequelize.define("dialysis_readings", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    collate: "utf8mb4_general_ci",
  },
  type: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  assign_range: {
    type: DataTypes.ENUM("yes", "no"),
    allowNull: false,
  },
  low_range: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  high_range: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  isGraph: {
    type: DataTypes.INTEGER(5),
    allowNull: true,
    defaultValue: 1,
  },
  showUser: {
    type: DataTypes.INTEGER(5),
    allowNull: true,
    defaultValue: 0,
  },
  unit: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: "",
  },
  priority_type: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  alertTextDoc: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: "",
  }
});

const DailyReadingsTranslations = sequelize.define(
  "daily_readings_translations",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    dr_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: DailyReadings,
        key: "id",
      },
    },
    language_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Language,
        key: "id",
      },
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      collate: "utf8mb4_general_ci",
    },
  }
);

const DialysisReadingsTranslations = sequelize.define(
  "dialysis_readings_translations",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    dr_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: DialysisReadings,
        key: "id",
      },
    },
    language_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Language,
        key: "id",
      },
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      collate: "utf8mb4_general_ci",
    },
  }
);

const DailyReadingAilments = sequelize.define("daily_reading_ailments", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  dr_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: DailyReadings,
      key: "id",
    },
  },
  ailmentID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Ailment,
      key: "id",
    },
  }
});

const DialysisReadingAilments = sequelize.define("dialysis_reading_ailments", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  dr_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: DialysisReadings,
      key: "id",
    },
  },
  ailmentID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Ailment,
      key: "id",
    },
  }
});

DailyReadings.hasMany(DailyReadingAilments, { foreignKey: "dr_id" , onDelete: 'CASCADE'});
DialysisReadings.hasMany(DialysisReadingAilments, { foreignKey: "dr_id" , onDelete: 'CASCADE'});
DailyReadingAilments.belongsTo(DailyReadings, { foreignKey: "dr_id" });
DialysisReadingAilments.belongsTo(DialysisReadings, { foreignKey: "dr_id" });

Ailment.hasMany(DailyReadingAilments, { foreignKey: "ailmentID" });
Ailment.hasMany(DialysisReadingAilments, { foreignKey: "ailmentID" });
DailyReadingAilments.belongsTo(Ailment, { foreignKey: "ailmentID" });
DialysisReadingAilments.belongsTo(Ailment, { foreignKey: "ailmentID" });

const missedReadings = sequelize.define("missed_readings", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  readingid: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  patientid: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  isdialysis: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  missedfrequency: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

DailyReadingsTranslations.belongsTo(DailyReadings, { foreignKey: "dr_id" });
DailyReadings.hasMany(DailyReadingsTranslations, { foreignKey: "dr_id" });

DialysisReadingsTranslations.belongsTo(DialysisReadings, {
  foreignKey: "dr_id",
});
DialysisReadings.hasMany(DialysisReadingsTranslations, { foreignKey: "dr_id" });

module.exports = {
  DailyReadings,
  DialysisReadings,
  DailyReadingsTranslations,
  DialysisReadingsTranslations,
  missedReadings,
  DailyReadingAilments,
  DialysisReadingAilments,
};
