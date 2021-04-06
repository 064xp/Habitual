window.addEventListener("load", onLoad);

function onLoad() {
  const esPaginaAutenticada = site.substring(0, 4) === "auth";
  const esPaginaInicio = site.substring(0, 4) === "init";
  if (esPaginaAutenticada) {
    requests.resHandlers.on401 = function () {
      window.location = "/";
      deleteCookie("authToken");
    };
  }

  validateAuthToken().then(function (esTokenValido) {
    if (esPaginaAutenticada && !esTokenValido) {
      window.location = "/";
    } else if (esPaginaInicio && esTokenValido) {
      window.location = "/dashboard.html";
    }
  });
}

function getCookie(cookie) {
  var cookies = document.cookie.split(";");

  for (var i = 0; i < cookies.length; i++) {
    var splitCookie = cookies[i].split("=");
    if (splitCookie[0].charAt(0) == " ")
      splitCookie[0] = splitCookie[0].substring(1);
    if (splitCookie[0] == cookie) return splitCookie[1];
  }
  return null;
}

function deleteCookie(cookie) {
  document.cookie = cookie + "=";
}

function validateAuthToken(cookie = "authToken") {
  const authCookie = getCookie(cookie);
  if (!authCookie || authCookie == "") {
    return new Promise(function (resolve, reject) {
      resolve(false);
    });
  } else {
    return requests.get("/api/user/verifyToken").then(function (res) {
      if (res.ok) return true;
      else return false;
    });
  }
}
