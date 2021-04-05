window.onload = function () {
  document
    .querySelector("#recordatorio-toggle")
    .addEventListener("change", toggleRecordatorio);
  document.querySelector("#habito-form").addEventListener("submit", onSubmit);
};

function toggleRecordatorio(e) {
  var timeInput = document.querySelector("#input-recordatorio");
  if (e.target.checked) {
    if (timeInput.value.length === 0) {
      timeInput.value = "00:00";
    }
    timeInput.style.display = "block";
  } else {
    timeInput.style.display = "none";
  }
}

function onSubmit(e) {
  e.preventDefault();
  var form = e.target;
  var recordatorio = form.recordar.checked
    ? toUTCTime(form.recordatorio.value)
    : null;

  var data = {
    name: form.nombre.value,
    type: form.tipo.value,
    frequency: form.frecuencia.value,
    reminder: recordatorio,
  };

  if ((site = "nuevoHabito")) {
    //enviar a ruta de nuevo habito
  } else if (site == "editarHabito") {
    //enviar a ruta de editar habito
  }
}

function toUTCTime(timeStr) {
  //Offset en horas a tiempo UTC
  var horasMin = timeStr.split(":");
  var offset = new Date().getTimezoneOffset() / 60;
  var utcHours = (parseInt(horasMin[0]) + offset) % 24;

  return utcHours.toString() + ":" + horasMin[1];
}
