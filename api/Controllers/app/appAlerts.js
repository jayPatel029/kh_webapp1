const {pool} = require("../../databaseConn/database.js")

const insertAlert = async (req, res) => {
    const {doctorEmail,patientId,category,mess} = req.body;
    console.log(doctorEmail,patientId,category,mess);
    try {
        const getDoctorNameQuery = `SELECT * FROM doctors WHERE email = '${doctorEmail}'`;
        var doname = await pool.query(getDoctorNameQuery);
        var dname = doname[0].name;
        var doctorId = doname[0].id;
        try {
            if (category === "Consult Doctor"){
                const date = new Date().toISOString().slice(0, 19).replace("T", " ");
                const message = `Please consult Dr. ${dname} immediately`;
                const insertQuery = `INSERT INTO app_alerts (patientId,doctorId,category,message,date) VALUES (${patientId},${doctorId},'${category}','${message}','${date}')`;
                await pool.query(insertQuery);
                return res.status(200).send("Alert Inserted");
            }
            else if(category === "Send Message"){
                const date = new Date().toISOString().slice(0, 19).replace("T", " ");
                const message = `Dr. ${dname} says: ${mess}`;
                const insertQuery = `INSERT INTO app_alerts (patientId,doctorId,category,message,date) VALUES (${patientId},${doctorId},'${category}','${message}','${date}')`;
                await pool.query(insertQuery);
                return res.status(200).send("Alert Inserted");
            }
            
        } catch (error) {
            console.log(error);
            return res.status(500).send("Internal Server Error");
            
        }    
    } catch (error) {
        console.log(error);
        return res.status(500).send("Internal Server Error");
        
    }
}

module.exports ={
    insertAlert
}