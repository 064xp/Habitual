const form = document.querySelector(".user_form");
requests.customHeaders.tz_offset = new Date().getTimezoneOffset();

form.addEventListener("submit", function (e) {
  e.preventDefault();
  const formType = form.getAttribute("data-form-type");
  if (formType == "login") login();
  else if (formType == "signup") signUp();
});

function login(correo, password) {
  const credenciales = {
    email: correo || document.querySelector("#email").value,
    password: password || document.querySelector("#pass").value,
  };

  requests.post("/api/user/login", credenciales).then(function (res) {
    if (res.ok) {
      localStorage.setItem("name", res.body.name);
      localStorage.setItem("email", correo);
      window.location = "/dashboard.html";
    } else {
      document.querySelector(".auth-error").classList.remove("hide");
    }
  });
}

function signUp() {
  const nombre = document.querySelector("#name").value;
  const correo = document.querySelector("#email").value;
  const password = document.querySelector("#pass").value;
  const confirmacion = document.querySelector("#conf_pass").value;

  if (validar(nombre, correo, password, confirmacion)) {
    requests
      .post("/api/user/signup", {
        name: nombre,
        email: correo,
        password: password,
        repeat_password: confirmacion,
      })
      .then(function (res) {
        if (res.ok) {
          login(correo, password);
        }
      });
  }
}

function validar(nombre, correo, password, confirmacion) {
  let errores = document.querySelectorAll(".auth-error");
  let expresionCorreo = /.+@.+\.\w+/;
  let elementoError = null;
  let esValido = true;

  //esconder todos los errores
  errores.forEach(function (el) {
    if (!el.classList.contains("hide")) el.classList.add("hide");
  });

  if (nombre.length < 2) {
    elementoError = document.querySelector("#error-name");
  } else if (!expresionCorreo.test(correo) || correo == "") {
    elementoError = document.querySelector("#error-email");
  } else if (password.length < 6 || password.length > 35) {
    elementoError = document.querySelector("#error-password");
  } else if (password !== confirmacion) {
    elementoError = document.querySelector("#error-conf");
  }
  if (elementoError) {
    elementoError.classList.remove("hide");
    esValido = false;
  }

  return esValido;
}
