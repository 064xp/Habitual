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
    recContainer.classList.remove("hide");
  } else {
    recContainer.classList.add("hide");
  }
}

function onSubmit(e) {
  e.preventDefault();
  var form = e.target;
  var recordatorio = null;
  var dias = null;
  var frecError = document.querySelector("#error-frecuencia");

  frecError.classList.add("hide");

  if (form.recordar.checked) recordatorio = toUTCTime(form.recordatorio.value);

  dias = [];
  Object.values(form.diasRec).forEach(function (dia) {
    if (dia.checked) dias.push(parseInt(dia.value));
  });

  if (dias.length == 0) {
    frecError.classList.remove("hide");
    return;
  }

  var data = {
    name: form.nombre.value,
    type: parseInt(form.tipo.value),
    frequency: dias,
    reminder: recordatorio,
  };

  console.log(data);

  if (site == "nuevoHabito") {
    requests.post("/api/habits/new", data).then(function (res) {
      console.log(res);
      if (res.ok) {
        alert("Agregado correctamente");
        window.location = "/dashboard.html";
      } else {
        alert(res.body.error);
      }
    });
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

  return [horaUTC, parseInt(horasMin[1])];
}
