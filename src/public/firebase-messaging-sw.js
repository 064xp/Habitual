importScripts("https://www.gstatic.com/firebasejs/8.4.1/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.4.1/firebase-messaging.js");

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
