const {pool} = require("../databaseConn/database.js");
const {getMessaging} = require("firebase/messaging");

const { initializeApp } = require("firebase/app");

const initialize = async () => {
    try {
        const firebaseConfig = {
            apiKey: process.env.FirebaseApiKey,
            authDomain: process.env.FirebaseAuthDomain,
            projectId: process.env.FirebaseProjectId,
            storageBucket: process.env.FirebaseStorageBucket,
            messagingSenderId: process.env.FirebaseMessagingSenderId,
            appId: process.env.FirebaseAppId,
            measurementId: process.env.FirebaseMeasurementId
        };
        
        try {
            const fireBaseapp =  await initializeApp(firebaseConfig);
            return fireBaseapp;
            
        } catch (error) {
            console.log(error);
            
        }
        
    } catch (error) {
        console.log(error);
        
    }
}



const pushNotifs = async (req, res) => {
    const fireBaseapp = await initialize();
    console.log(fireBaseapp);
    const {user_id, message,title} = req.body;
    // get push notification id from user_id
    const query = `SELECT * FROM patients WHERE id = ${user_id}`
    try {
        const patient = await pool.query(query);
        const pushNotifId = patient[0].push_notification_id;
        // console.log(pushNotifId);
        const messageBody = {
            notification:{
                title: title,
                body: message
            },
            token: pushNotifId
        }
        console.log(messageBody);
        try {

            const messaging = getMessaging(fireBaseapp);
            try {
                const response = await messaging.send(messageBody);
                
            } catch (error) {
                console.log(error);
                
            }
            console.log(response);
            res.send(response);
            
        } catch (error) {
            console.log(error);
            
        }

        
    } catch (error) {
        res.send(error);
    }
}

module.exports = {
    pushNotifs
}