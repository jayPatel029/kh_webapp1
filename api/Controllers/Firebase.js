const { initializeApp } = require("firebase/app");

const firebaseConfig = {
    apiKey: process.env.FirebaseApiKey,
    authDomain: process.env.FirebaseAuthDomain,
    projectId: process.env.FirebaseProjectId,
    storageBucket: process.env.FirebaseStorageBucket,
    messagingSenderId: process.env.FirebaseMessagingSenderId,
    appId: process.env.FirebaseAppId,
    measurementId: process.env.FirebaseMeasurementId
};

const fireBaseapp = initializeApp(firebaseConfig);

module.exports = fireBaseapp;


  