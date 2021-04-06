function getCookie(cookie) {
  var cookies = document.cookie.split(";");

  for (var i = 0; i < cookies.length; i++) {
    var splitCookie = cookies[i].split("=");
    if (splitCookie[0].charAt(0) == " ") return splitCookie.substring(1);
    if (splitCookie[0] == cookie) return splitCookie[1];
  }
  return null;
}

if (!getCookie("authToken") || getCookie("authToken") == "") {
  window.location = "/";
}
