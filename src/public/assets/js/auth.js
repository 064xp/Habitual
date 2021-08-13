const form = document.querySelector(".user_form");
let code;
requests.customHeaders.tz_offset = new Date().getTimezoneOffset();

form.addEventListener("submit", function(e) {
  e.preventDefault();

  const formType = form.getAttribute("data-form-type");
  if (formType == "login") login();
  else if (formType == "signup") signUp();
  else if (formType == "password_reset_email") passResetEmail();
  else if (formType == "password_reset_form") passReset();
});

function login(correo, password) {
  const credenciales = {
    email: correo || document.querySelector("#email").value,
    password: password || document.querySelector("#pass").value
  };

  requests.post("/api/auth/login", credenciales).then(function(res) {
    if (res.ok) {
      localStorage.setItem("name", res.body.name);
      localStorage.setItem("email", res.body.email);
    } else {
      document.querySelector(".auth-error").classList.remove("hide");
    }
    if (Notification.permission == "granted")
      registrarFCMToken().then(function() {
        window.location = "/dashboard.html";
      });
  });
}

function signUp() {
  const nombre = document.querySelector("#name").value;
  const correo = document.querySelector("#email").value;
  const password = document.querySelector("#pass").value;
  const confirmacion = document.querySelector("#conf_pass").value;

  if (validar(nombre, correo, password, confirmacion)) {
    requests
      .post("/api/auth/signup", {
        name: nombre,
        email: correo,
        password: password,
        repeat_password: confirmacion
      })
      .then(function(res) {
        if (res.ok) {
          login(correo, password);
        } else if (res.body.error === "Email is already in use") {
          document
            .querySelector("#error-email_exists")
            .classList.remove("hide");
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
  errores.forEach(function(el) {
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

function passResetEmail() {
  const email = document.querySelector("#email").value;

  requests
    .post("/api/auth/passwordReset", {
      email: email
    })
    .then(function(res) {
      if (res.ok) {
        swal({
          title: "Enseguida recibirás un correo con un link de recuperación!",
          icon: "success"
        }).then(function() {
          window.location = "/";
        });
      } else {
        document.querySelector(".auth-error").classList.remove("hide");
      }
    });
}

function passReset() {
  const password = document.querySelector("#password").value;
  const passwordConf = document.querySelector("#passwordConf").value;
  const authError = document.querySelector(".auth-error");
  const resetCode = authError.classList.add("hide");

  if (password !== passwordConf) {
    authError.innerText = "Las contraseñas no concuerdan";
    authError.classList.remove("hide");
    return;
  }

  requests
    .post("/api/auth/resetPassword", {
      code: code,
      password: password,
      passwordConf: passwordConf
    })
    .then(function(res) {
      if (res.ok) {
        swal({
          title: "Contraseña cambiada exitosamente!",
          icon: "success",
          timer: 1500
        }).then(function() {
          window.location = "/";
        });
      } else if (res.status === 400) {
        authError.innerText = res.body.error;
        authError.classList.remove("hide");
      } else {
        swal({
          title: "Ocurrió un error",
          text: "Inténtalo de nuevo más tarde",
          icon: "error"
        });
      }
    });
}

function validateRecoveryCode() {
  const params = new URLSearchParams(window.location.search);
  code = params.get("recoveryCode");

  if (code === null) {
    showInvalidRecoveryCode();
    return;
  }

  requests
    .post("/api/auth/validateRecoveryCode", {
      code: code
    })
    .then(function(res) {
      if (res.status !== 200) {
        showInvalidRecoveryCode(res.status);
      }
    });
}

function showInvalidRecoveryCode(statusCode = 401) {
  const errorModal = document.querySelector(".invalid-error");
  const modalTitle = document.querySelector("#invalid-error_title");
  const modalP = document.querySelector("#invalid-error_p");

  if (statusCode === 401) {
    modalTitle.innerText = "Este link no es válido";
    modalP.innerText =
      "Verifique que haya seguido el enlace que recibió a su correo correctamente.";
  } else if (statusCode === 410) {
    modalTitle.innerText = "Este link ha expirado";
    modalP.innerText =
      "Ya ha pasado mucho tiempo desde que generó este link. Por favor genere uno nuevo.";
  }

  form.classList.add("hide");
  errorModal.classList.remove("hide");
}

if (site === "init_passResetForm") {
  validateRecoveryCode();
}
