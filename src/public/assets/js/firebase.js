var firebaseConfig = {
  apiKey: "AIzaSyDxuVYEIgAicy7ZRb53AGeFYhs3-EnvXJI",
  authDomain: "habitual-88569.firebaseapp.com",
  projectId: "habitual-88569",
  storageBucket: "habitual-88569.appspot.com",
  messagingSenderId: "940428300578",
  appId: "1:940428300578:web:36e968833c47d6e0b1557b",
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

const recordatorioToggle = document.querySelector("#recordatorio-toggle");

if (recordatorioToggle)
  recordatorioToggle.addEventListener("change", function () {
    if (this.checked) notificationRegister();
  });

messaging.onMessage(function (payload) {
  console.log(payload);
});

function notificationRegister() {
  if (Notification.permission != "granted") {
    messaging
      .requestPermission()
      .then(function () {
        console.log("Permission granted!");
        return messaging.getToken();
      })
      .then(function (token) {
        console.log(token);
      })
      .catch(function () {
        recordatorioToggle.checked = false;
        console.log("Permission denied");
      });
  }
}
