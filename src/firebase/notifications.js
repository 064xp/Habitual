const admin = require("firebase-admin");
var serviceAccount = require("./creds/firebase-admin-creds.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports.sendReminderNotification = (
  userTokens,
  title,
  body,
  habitID = null,
  habitName = null,
  image = "https://i.imgur.com/Bow93vn.png"
) => {
  if (!userTokens || userTokens.length === 0) return;
  const message = {
    notification: {
      title: title,
      body: body,
    },
    data: {
      habitName: habitName,
      habitID: habitID,
    },
    tokens: userTokens,
    webpush: {
      headers: {
        Urgency: "high",
        image: image,
      },
    },
  };

  admin
    .messaging()
    .sendMulticast(message)
    .then((response) => {
      // Response is a message ID string.
      console.log("Successfully sent message:", response);
    })
    .catch((error) => {
      console.log("Error sending message:", error);
    });
};
