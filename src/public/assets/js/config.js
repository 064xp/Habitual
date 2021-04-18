window.addEventListener("load", function () {
  var correo = localStorage.getItem("email");
  var nombre = localStorage.getItem("name");

  document.querySelector("#user-name").innerText = nombre;
  document.querySelector("#email").innerText = correo;
});
