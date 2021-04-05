window.onload = function () {
  document
    .querySelector("#recordatorio-toggle")
    .addEventListener("change", toggleRecordatorio);
  document.querySelector("#habito-form").addEventListener("submit", onSubmit);
};

function toggleRecordatorio(e) {
  var timeInput = document.querySelector("#input-recordatorio");
  var recContainer = document.querySelector(".recordatorio-container");
  if (e.target.checked) {
    if (timeInput.value.length === 0) {
      timeInput.value = "00:00";
    }
    recContainer.style.display = "block";
  } else {
    recContainer.style.display = "none";
  }
}

function onSubmit(e) {
  e.preventDefault();
  var form = e.target;
  var recordatorio = form.recordar.checked
    ? toUTCTime(form.recordatorio.value)
    : null;
  var dias = [];

  Object.values(form.diasRec).forEach(function (dia) {
    if (dia.checked) dias.push(dia.value);
  });

  var data = {
    name: form.nombre.value,
    type: form.tipo.value,
    frequency: form.frecuencia.value,
    reminder: recordatorio,
    reminderDays: dias,
  };

  console.log(data);

  if (site == "nuevoHabito") {
    //enviar a ruta de nuevo habito
  } else if (site == "editarHabito") {
    //enviar a ruta de editar habito
  }
}

function toUTCTime(timeStr) {
  //Offset en horas a tiempo UTC
  var horasMin = timeStr.split(":");
  var offset = new Date().getTimezoneOffset();
  var totalMin = parseInt(horasMin[0]) * 60 + parseInt(horasMin[1]);
  var horaUTC = Math.floor(((totalMin + offset) / 60) % 24);
  var horaStr = horaUTC.toString();
  horaStr = horaStr.length == 1 ? "0" + horaStr : horaStr;

  return horaStr + ":" + horasMin[1];
}
