window.addEventListener("load", function () {
  var correo = localStorage.getItem("email");
  var nombre = localStorage.getItem("name");

  document.querySelector("#user-name").innerText = nombre;
  document.querySelector("#email").innerText = correo;
});

document.querySelector("#btn-signout").addEventListener("click", cerrarSesion);

function cerrarSesion() {
  eliminarFCMToken().then(function () {
    requests.post("/api/auth/logout").then(function (res) {
      localStorage.clear();
      window.location = "/";
    });
  });
}
