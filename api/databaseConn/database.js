const dotenv = require("dotenv");
const mariadb = require("mariadb");

dotenv.config();
const pool = mariadb.createPool({
  host: 'localhost',
  user: 'root',
  password: 'neeljain',
  database: 'maria',
  port: 3310,
});

const Sequelize = require("sequelize");

// Create a new Sequelize instance
const sequelize = new Sequelize(
  "maria",
  "root",
  "neeljain",
  {
    host: "localhost",
    dialect: "mariadb",
    port: 3310,
    logging: false,
    dialectOptions: {
      useUTC: false,
    },
    timezone: "+05:30",
  }
);

async function connectToDatabase() {
  let conn;
  try {
    conn = await pool.getConnection();
    console.log("db connection successfull");
    sequelize
      .authenticate()
      .then(() => {
        console.log("Sequelize Connection has been established successfully.");
      })
      .catch((error) => {
        console.error("Unable to connect to the database:", error);
      });
  } catch (error) {
    console.error("db connection failed", error);
  } finally {
    if (conn) conn.release(); //release to pool
  }
}

module.exports = {
  connectToDatabase,
  pool,
  sequelize,
};
