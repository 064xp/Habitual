const form = document.querySelector(".user_form");

form.addEventListener("submit", function (e) {
  e.preventDefault();
  console.log("submit");
  const formType = form.getAttribute("data-form-type");
  if (formType == "login") login();
  else if (formType == "signup") signUp();
});

function login() {
  const credenciales = {
    email: document.querySelector("#email").value,
    password: document.querySelector("#pass").value,
  };

  requests.post("/api/user/login", credenciales).then(function (res) {
    if (res.ok) alert("Credenciales correctas");
    else alert("No valido");
  });
}
