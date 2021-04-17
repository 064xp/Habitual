const admin = require("firebase-admin");
var serviceAccount = require("./creds/firebase-admin-creds.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

var regTokens = [
  "fW0Z7sdSHDosRDlAYaYoCi:APA91bHd710BZkAGv0AlmmjDCTXL2jP5m5-9O10IcKHvFiX5pGyc7yZoN-JvbtHyGHG-eISdnuYYFisYi65Yoceeh3tyUxKiPreMcaDszfNTfCHGOjuteYall4UuinrfhXY6aUufJA90",
];

const sendNotification = (userTokens, title, body) => {
  const message = {
    notification: {
      title: title,
      body: body,
    },
    tokens: userTokens,
    webpush: {
      headers: {
        Urgency: "high",
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

sendNotification(regTokens, "Test", "Hello man!");
