const { ContactUs } = require("../Models/contactus");
const { pool } = require("../databaseConn/database");

const insertContactUs = async (req, res) => {
  const { phoneno, email, message,patientId } = req.body;
  try {
    const contactus = await ContactUs.create({ phoneno, email, message });
    const insertedId = contactus.dataValues.id;
    const type = "patient";
    const category = "Contact Us";
    const date = new Date().toISOString().slice(0, 19).replace("T", " ");
    const query = `INSERT INTO alerts (type, category, userEmail,date,patientId,contactUsId) VALUES ('${type}', '${category}', '${email}','${date}',${patientId},${insertedId})`;
    try {
      const response = await pool.query(query);
    } catch (error) {
      console.log(error);
    }
    res.status(201).json({ contactus });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllContactUs = async (req, res) => {
  try {
    const contactus = await ContactUs.findAll();
    res.status(200).json({ contactus });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getContactUsById = async (req, res) => {
  const { id } = req.params;
  try {
    const contactus = await ContactUs.findOne({ where: { id } });
    const allMessages = await ContactUs.findAll(
      {
        where: { email: contactus.email },
        order: [["createdAt", "DESC"]],
      }
    );
    res.status(200).json({ contactus, allMessages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteContactUs = async (req, res) => {
  const { id } = req.params;
  try {
    await ContactUs.destroy({ where: { id } });
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { insertContactUs, getAllContactUs, getContactUsById, deleteContactUs};
