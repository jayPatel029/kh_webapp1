const { DataTypes } = require("sequelize");
const { sequelize } = require("../databaseConn/database");

const AlarmDoses = sequelize.define(
  "alarm_doses",
  {
    autoID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    alarmID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "alarm",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    time: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    doses: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    unitType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "alarm_doses",
    collate: "utf8mb4_general_ci",
    engine: "InnoDB",
  }
);

const AlarmAnswers = sequelize.define(
  "alarm_answers",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    alarmID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "alarm",
        key: "id",
      },
    },
    alarmDoseID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "alarm_doses",
        key: "autoID",
      },
    },
    time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "alarm_answers",
  }
);

module.exports = {
  AlarmDoses,
  AlarmAnswers,
};
