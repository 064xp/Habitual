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

messaging.onMessage(function (payload) {
  var audio = new Audio("assets/audio/notification.mp3");
  audio.play();
  swal({
    title: payload.data.habitName,
    text: `Es hora de ${payload.data.habitName}.\nCumple tu meta!`,
    icon: "assets/img/bell.svg",
  });
});

function registrarFCMToken() {
  return messaging
    .getToken()
    .then(function (token) {
      if (!getTokenSent()) {
        return requests
          .post("/api/users/fcm-token", {
            token: token,
          })
          .then(function (res) {
            if (res.ok) {
              setTokenSent(true);
            }
          })
          .catch((err) => console.log(err));
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
      registrarFCMToken().then(function () {
        console.log("Token registrado");
      });
    }
  });
}

function eliminarFCMToken() {
  return messaging
    .getToken()
    .then((tokenActual) => {
      return messaging
        .deleteToken(tokenActual)
        .then(() => {
          console.log("delete token firebas");
          return requests
            .delete("/api/users/fcm-token", {
              token: tokenActual,
            })
            .then(function (res) {
              console.log("delete token postgres");
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
