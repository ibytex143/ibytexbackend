const admin = require("../config/firebaseAdmin");

const sendNotification = async (token, title, body) => {
  if (!token) return;

  const message = {
    token,
    notification: {
      title,
      body,
    },
  };

  try {
    await admin.messaging().send(message);
    console.log("Notification sent");
  } catch (error) {
    console.error("FCM ERROR:", error.message);
  }
};

module.exports = sendNotification;