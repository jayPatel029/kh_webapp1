const admin = require("firebase-admin");

// Initialize Firebase Admin SDK with your service account credentials
const serviceAccount = require("./kifayti-health-firebase-adminsdk-q8oz9-c308915d5c.json");
const { pool } = require("../../databaseConn/database.js");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Function to send push notification
// async function sendPushNotification() {
//   try {
//     const message = {
//       notification: {
//         title: "Hello from Node.js!",
//         body: "Hello sir",
//         type: "Alarm",
//       },
//       token:
//         "f482XyP6R_6km1kpVHkqJ3:APA91bEqNmraS4WHqqAc-K6ow8WzOhKTaRgLoP7mU_q_dLLMZ2LH6d2wJZV6GaJAM2sW9Z0f_gz3INbHpGibuK8DJTUaXRMeRjavC23uDZfn5DKhF1asMGX6PezXNShfI3NXIdG7GPpv",
//     };

//     const response = await admin.messaging().send(message);
//     console.log("Successfully sent message:", response);
//   } catch (error) {
//     console.error("Error sending message:", error);
//   }
// }



// async function sendPushNotification(customData) {
//   console.log("Triggering push notification!");

//   try {
//     // const token = userTokens[userId];
//     // if (!token) {
//     //   console.log("Token not found for user", userId);
//     //   return;
//     // }

//     const message = {
//       notification: {
//         title: customData.title || "Default Title",
//         body: customData.body || "Default Body",
//       },
//       data: {
//         type: customData.type || "General", 
//         customField: customData.customField || "Default Value",
//       },
//       //! make this dynamic
//       token: "dlKI5c1pRC27_0gKFABl10:APA91bFplJCq_yBg2qbvmggWYIXDVzVLkimxntNP5CEWan99oyHJzbiA7iVp4n3tEuNe4Kg2T1TReePgYjOPthiSv1hsduQ1vKUTE9SCw74Sura2i_9dJMg",  
//     };

//     const response = await admin.messaging().send(message);
//     console.log("Successfully sent message:", response);
//   } catch (error) {
//     console.error("Error sending message:", error);
//   }
// }



const sendPushNotification = async (customData, userId) => {
  console.log("Triggering push notification!");

  try {
    // Fetch the token from the `patients` table
    const query = "SELECT push_notification_id FROM patients WHERE id = ?";
    const [result] = await pool.query(query, [userId]);

    // Log the result to debug
    console.log("Query result:", result);

    // Use the correct property from the result
    const token = result.push_notification_id;
    if (!token) {
      console.log(`Push notification token not found for user ID: ${userId}`);
      return;
    }

    console.log(`Fetched token for user ID ${userId}: ${token}`);

    // Construct the message
    const message = {
      notification: {
        title: customData.title || "Default Title",
        body: customData.body || "Default Body",
      },
      data: {
        type: customData.type || "General",
        customField: customData.customField || "Default Value",
      },
      token: token, // Use the dynamically fetched token
    };

    // Send the notification
    const response = await admin.messaging().send(message);
    console.log("Successfully sent message:", response);
  } catch (error) {
    console.error("Error sending message:", error);
  }
};




module.exports = {
  sendPushNotification,
};
