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
    if (this.checked) pedirPermisoNotificar();
  });

messaging.onMessage(function (payload) {
  console.log(payload);
});

function registrarFCMToken() {
  messaging
    .getToken()
    .then(function (token) {
      if (!getTokenSent()) {
        requests
          .post("/api/users/fcm-token", {
            token: token,
          })
          .then(function (res) {
            if (res.ok) setTokenSent(true);
          });
      }
    })
    .catch(function () {
      recordatorioToggle.checked = false;
      setTokenSent(false);
    });
}

function pedirPermisoNotificar() {
  console.log("Requesting permission...");
  Notification.requestPermission().then((permission) => {
    if (permission === "granted") {
      registrarFCMToken();
    }
  });
}

function eliminarFCMToken() {
  messaging
    .getToken()
    .then((tokenActual) => {
      messaging
        .deleteToken(tokenActual)
        .then(() => {
          requests
            .delete("/api/users/fcm-token", {
              token: tokenActual,
            })
            .then(function (res) {
              if (res.ok) setTokenSent(false);
            });
        })
        .catch((err) => {
          console.log("Unable to delete token. ", err);
        });
    })
    .catch((err) => {
      console.log("Error retrieving registration token. ", err);
    });
}

function setTokenSent(val) {
  localStorage.setItem("FCMTokenSent", val);
}

function getTokenSent() {
  const val = localStorage.getItem("FCMTokenSent");

  return val === "true" ? true : false;
}
