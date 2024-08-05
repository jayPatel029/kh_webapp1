const { DataTypes } = require("sequelize");
const { sequelize } = require("../databaseConn/database");

// Define the LabReadings model
const LabReadings = sequelize.define("labReadings", {
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
  isGraph: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 1,
  },
  unit: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: "",
  },
  low_range: {
    type: DataTypes.FLOAT, // Use FLOAT to accommodate decimal ranges
    allowNull: true,
  },
  high_range: {
    type: DataTypes.FLOAT, // Use FLOAT to accommodate decimal ranges
    allowNull: true,
  },
});

// Sample data to insert
const readingsData = [
  { title: "Hemoglobin", unit: "g/dL", low_range: 13.00, high_range: 17.00 },
  { title: "Packed Cell Volume (PCV)", unit: "%", low_range: 40.00, high_range: 50.00 },
  { title: "RBC Count", unit: "mill/mm3", low_range: 4.50, high_range: 5.50 },
  { title: "MCV", unit: "fL", low_range: 80.00, high_range: 100.00 },
  { title: "MCH", unit: "pg", low_range: 27.00, high_range: 32.00 },
  { title: "MCHC", unit: "g/dL", low_range: 32.00, high_range: 35.00 },
  { title: "Red Cell Distribution Width (RDW)", unit: "%", low_range: 11.50, high_range: 14.50 },
  { title: "Total Leukocyte Count (TLC)", unit: "thou/mm3", low_range: 4.00, high_range: 10.00 },
  { title: "Segmented Neutrophils", unit: "%", low_range: 40.00, high_range: 80.00 },
  { title: "Lymphocytes", unit: "%", low_range: 20.00, high_range: 40.00 },
  { title: "Monocytes", unit: "%", low_range: 2.00, high_range: 10.00 },
  { title: "Eosinophils", unit: "%", low_range: 1.00, high_range: 6.00 },
  { title: "Basophils", unit: "%", low_range: 0, high_range: 2.00 }, // "<2.00" converted to high_range of 2.00
  { title: "Neutrophils (absolute)", unit: "thou/mm3", low_range: 2.00, high_range: 7.00 },
  { title: "Lymphocytes (absolute)", unit: "thou/mm3", low_range: 1.00, high_range: 3.00 },
  { title: "Monocytes (absolute)", unit: "thou/mm3", low_range: 0.20, high_range: 1.00 },
  { title: "Eosinophils (absolute)", unit: "thou/mm3", low_range: 0.02, high_range: 0.50 },
  { title: "Basophils (absolute)", unit: "thou/mm3", low_range: 0.01, high_range: 0.10 },
  { title: "Platelet Count", unit: "thou/mm3", low_range: 150.00, high_range: 450.00 },
];

// Function to insert data into the database
const insertReadings = async () => {
  try {
    await sequelize.sync(); // Ensure the database is in sync

    for (const reading of readingsData) {
      await LabReadings.create(reading);
    }

    console.log("Readings data inserted successfully!");
  } catch (error) {
    console.error("Error inserting readings data:", error);
  }
};

// Run the insert function
// insertReadings();


// Define the graphReadingsLab model
const GraphReadingsLab = sequelize.define("graphReadingsLab", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  questionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  readings: {
    type: DataTypes.STRING(255),
    allowNull: false,
  }
});

// Export the models
module.exports = {
  LabReadings,
  GraphReadingsLab
};
