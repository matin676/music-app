const path = require("path");
const admin = require("firebase-admin");

try {
  // const serviceAccount = require(path.join(
  //   __dirname,
  //   "serviceAccountKey.json"
  // ));
  const serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_KEY);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  console.log("Firebase initialized successfully");
} catch (error) {
  console.error("Error initializing Firebase:", error);
}

module.exports = admin;
