const admin = require("firebase-admin");

// Initialize Firebase Admin SDK with your service account credentials
const serviceAccount = require("./kifayti-health-firebase-adminsdk-q8oz9-c308915d5c.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Function to send push notification
async function sendPushNotification() {
  try {
    const message = {
      notification: {
        title: "Hello from Node.js!",
        body: "Hello sir",
        type: "Alarm",
      },
      token:
        "f482XyP6R_6km1kpVHkqJ3:APA91bEqNmraS4WHqqAc-K6ow8WzOhKTaRgLoP7mU_q_dLLMZ2LH6d2wJZV6GaJAM2sW9Z0f_gz3INbHpGibuK8DJTUaXRMeRjavC23uDZfn5DKhF1asMGX6PezXNShfI3NXIdG7GPpv",
    };

    const response = await admin.messaging().send(message);
    console.log("Successfully sent message:", response);
  } catch (error) {
    console.error("Error sending message:", error);
  }
}

module.exports = {
  sendPushNotification,
};
