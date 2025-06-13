const { pool } = require("../databaseConn/database.js");
const { isDoctor } = require("./Users.js");
const {sendPushNotification} = require("./app/notification.js")
const getComments = async (req, res, next) => {
    const { fileId, fileType } = req.body;

    // SQL query to join comments with doctor table and get doctor name
    const query = `
          SELECT 
            comments.*,
            doctors.name AS doctorName
        FROM 
            comments
        LEFT JOIN 
            doctors ON comments.doctorId = doctors.id
        WHERE 
            comments.typeId = ? AND comments.type = ?`;

    try {
        // Execute the query with parameterized inputs for security
        const comments = await pool.query(query, [fileId, fileType]);
        console.log("all comments:", comments);
        res.status(200).json({
            success: true,
            data: comments,
        });
    } catch (error) {
        console.error("Error getting comments:", error);
        res.status(400).json({
            success: false,
            message: "Something went wrong",
        });
    }
};


const addToReadTable = async (doctorId, commentId) => {
    const query = `INSERT INTO commentsread (commentId,isRead,doctorId) VALUES ('${commentId}',0,'${doctorId}')`;
    try {
        await pool.query(query);

    } catch (error) {
        console.error("Error adding to read table:", error);

    }
};

const updateReadTable = async (req, res) => {
    const { email, commentIds } = req.body;

    const query = `SELECT * FROM doctors WHERE email='${email}'`;
    try {
        var doctor = await pool.query(query);
        const doctorId = doctor[0].id;
        try {
            for (let i = 0; i < commentIds.length; i++) {
                const commentId = commentIds[i];
                const query1 = `UPDATE commentsread SET isRead=1 WHERE doctorId=${doctorId} AND commentId=${commentId}`;
                try {
                    await pool.query(query1);

                } catch (error) {
                    console.error("Error updating read status:", error);
                    res.status(400).json({
                        success: false,
                        message: "Something went wrong",
                    });

                }
            }
            res.status(200).json({
                success: true,
                message: "Read status updated successfully",
            });

        } catch (error) {
            console.error("Error updating read status:", error);
            res.status(400).json({
                success: false,
                message: "Something went wrong",
            });

        }

    } catch (error) {

        console.error("Error getting doctor:", error);
        res.status(400).json({
            success: false,
            message: "Something went wrong",
        });

    }

}

const addComment = async (req, res, next) => {
    const { content, fileId, fileType, userId, iSDoctor, doctorId:doctorEmail ,docId } = req.body;
    console.log("doctors",req.body);
    const date = new Date().toISOString().slice(0, 19).replace('T', ' ');
    var uid = 0;
    let commentingUserId=userId;
    let commentingDoctorId=0;
    if (iSDoctor === 1) {
        const query = `SELECT * FROM doctors WHERE email='${docId}'`;
        try {
            const doctor = await pool.query(query);
            commentingDoctorId = doctor[0].id;
        } catch (error) {
            console.error("Error getting doctor:", error);
            res.status(400).json({
                success: false,
                message: "Something went wrong",
            });

        }

    }
    const query = `INSERT INTO comments (content,userId,typeId,isDoctor,date,type,doctorId) VALUES ('${content}','${commentingUserId}','${fileId}','${iSDoctor}','${date}','${fileType}','${commentingDoctorId}')`;

    try {
        const result = await pool.query(query);
        cid = Number(result.insertId);
        if (iSDoctor === 0) {
            const query1 = `SELECT * FROM doctor_patients WHERE patient_id=${userId}`;
            try {
                const doctors = await pool.query(query1);
                for (let i = 0; i < doctors.length; i++) {
                    const doctor = doctors[i];
                    await addToReadTable(doctor.doctor_id, cid);
                }

            } catch (error) {
                console.error("Error adding to read table:", error);
                res.status(400).json({
                    success: false,
                    message: "Something went wrong",
                });

            }
        }
        else {
            try {

                await addToReadTable(uid, cid);

            } catch (error) {
                console.error("Error adding to read table:", error);
                res.status(400).json({
                    success: false,
                    message: "Something went wrong",
                });

            }
        }
        const pushNotiData = {
            title: "New Comment",
            body: `A new ${fileType} comment has been added.`,
            type: "New Comment",
            customField: "This is a custom notification from Firebase.",
        };

        try {
            await sendPushNotification(pushNotiData, userId);
            console.log("Push Notification Sent Successfully");
        } catch (error) {
            console.error("Error Sending Push Notification:", error);}
        res.status(200).json({
            success: true,
            message: "Comment added successfully",
            data: Number(result.insertId),
        });

    } catch (error) {
        console.error("Error adding comment:", error);
        res.status(400).json({
            success: false,
            message: "Something went wrong",
        });
    }

};


const getPatientComments = async (req, res, next) => {
    const { patientId } = req.body;
    const query = `SELECT * FROM comments WHERE isDoctor=0 AND userId=${patientId}`;
    try {
        const comments = await pool.query(query);
        res.status(200).json({
            success: true,
            data: comments,
        });

    } catch (error) {
        console.error("Error getting comments:", error);
        res.status(400).json({
            success: false,
            message: "Something went wrong",
        });

    }
}




const getDatafromComment = async (comment, did) => {
    const userId = comment.userId;

    const query1 = `SELECT * FROM patients WHERE id=${userId}`;
    const patientResult = await pool.query(query1);
    const patient = patientResult[0];

    let url = "";
    let fid = comment.typeId;
    let fdate = "";
    let ftype = "";

    const getFileData = async (tableName, id) => {
        const query = `SELECT * FROM ${tableName} WHERE id=${id}`;
        const result = await pool.query(query);
        return result[0];
    };

    let fileData;
    if (comment.type === "Prescription") {
        fileData = await getFileData("prescriptions", comment.typeId);
        url = fileData?.Prescription;
        fdate = fileData?.Date;
        ftype = "Prescription";
    } else if (comment.type === "Lab Report") {
        fileData = await getFileData("labreport", comment.typeId);
        url = fileData?.Lab_Report;
        fdate = fileData?.Date;
        ftype = fileData?.Report_Type;
    } else if (comment.type === "Requisition") {
        fileData = await getFileData("requisition", comment.typeId);
        url = fileData?.Requisition;
        fdate = fileData?.Date;
        ftype = "Requisition";
    }

    const query3 = `SELECT * FROM commentsread WHERE commentId=${comment.id} AND doctorId=${did}`;
    let isRead = false;
    try {
        const readResult = await pool.query(query3);
        if (readResult.length > 0) {
            isRead = readResult[0]?.isRead === 1;
        }
    } catch (error) {
        console.error("Error getting read status:", error);
    }

    const data = {
        id: comment.id,
        name: patient?.name,
        url: url || "",
        fileId: fid,
        fileType: ftype || "",
        fDate: fdate || "",
        date: comment.date,
        content: comment.content,
        isRead: isRead,
        userId: userId,
    };

    return data;
};



const getDoctorComments = async (req, res, next) => {
    try {
        const { email } = req.body;
        const query = `SELECT * FROM doctors WHERE email='${email}'`;
        const doctor = await pool.query(query);
        const doctorId = doctor[0].id;
        var did = String(doctorId);
        const query1 = `SELECT * FROM patients`
        const patients = await pool.query(query1);
        var patientIds = [];
        const getCommentsCount = `SELECT * FROM commentsread WHERE doctorId=${doctorId} AND isRead=0`;
        var count = await pool.query(getCommentsCount);
        count = count.length;

        // for (let i = 0; i < patients.length; i++) {
        //     const patient = patients[i];
        //     var medicalTeam = patient.medical_team;
        //     var med = medicalTeam.split(",");
        //     if (med.includes(did)) {
        //         patientIds.push(patient.id);
        //     }
        // }
        const patientQuery = `SELECT * FROM doctor_patients WHERE doctor_id=${doctorId}`;
        try {
            const patientData = await pool.query(patientQuery);
            for (let i = 0; i < patientData.length; i++) {
                const patient = patientData[i];
                patientIds.push(patient.patient_id);
            }

        } catch (error) {
            console.error("Error getting patients:", error);
        }
        var comments = [];
        for (let i = 0; i < patientIds.length; i++) {
            const patientId = patientIds[i];
            const query2 = `SELECT c.*
                        FROM comments c
                        JOIN commentsread cr ON c.id = cr.commentId
                        WHERE c.userId = ${patientId} AND c.isDoctor = 0 AND cr.doctorId = ${doctorId};`
            const comments1 = await pool.query(query2);
            comments = comments.concat(comments1);
        }


        var data = [];
        for (let i = 0; i < comments.length; i++) {
            const comment = comments[i];
            const d = await getDatafromComment(comment, did);
            data.push(d);
        }

        res.status(200).json({
            success: true,
            data: data,
            count: count,

        });

    } catch (error) {
        console.error("Error getting comments:", error);
        res.status(400).json({
            success: false,
            message: "Something went wrong",
        });

    }
};


module.exports = {
    getComments,
    addComment,
    getPatientComments,
    getDoctorComments,
    updateReadTable
};