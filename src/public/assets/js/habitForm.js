window.addEventListener("load", function () {
  document
    .querySelector("#recordatorio-toggle")
    .addEventListener("change", toggleRecordatorio);
  document.querySelector("#habito-form").addEventListener("submit", onSubmit);

  if (site == "auth_editarHabito") {
    var habitID = getParam("habitID");
    if (!habitID) window.location = "/";
    requests.get("/api/habits/" + habitID).then(function (res) {
      if (!res.ok) {
        alert("Ocurrio un error, intentalo mas tarde");
        window.location = "/";
      }
      console.log(res.body.habit);
      rellenarCampos(res.body.habit);
    });
  }
});

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

  dias = getDias(form.diasRec, frecError);
  if (!dias) return;

  var data = {
    name: form.nombre.value,
    type: parseInt(form.tipo.value),
    frequency: dias,
    reminder: recordatorio,
  };

  if (site == "auth_nuevoHabito") {
    requests.post("/api/habits/new", data).then(function (res) {
      console.log(res);
      if (res.ok) {
        alert("Agregado correctamente");
        window.location = "/dashboard.html";
      } else {
        alert(res.body.error);
      }
    });
  } else if (site == "auth_editarHabito") {
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

function getDias(elems, error) {
  var dias = [];
  Object.values(elems).forEach(function (dia) {
    if (dia.checked) dias.push(parseInt(dia.value));
  });

  if (dias.length == 0) {
    error.classList.remove("hide");
    return null;
  }
  return dias;
}

function getParam(searchParam) {
  var params = window.location.search;
  params = params.replace("?", "").split("&");
  for (var i = 0; i < params.length; i++) {
    var param = params[i].split("=");
    if (param[0] == searchParam) return param[1];
  }

  return null;
}

function rellenarCampos(habit) {
  const nombreTitulo = document.querySelector("#titulo_nombre-habito");
  const nombre = document.querySelector("#nombre-habito");
  const tipos = document.querySelectorAll(".radio-tipo_habito");
  const dias = document.querySelectorAll(".rec-dias_checkbox");
  const recordatorioToggle = document.querySelector("#recordatorio-toggle");
  const inputRec = document.querySelector("#input-recordatorio");

  nombreTitulo.innerText = '"' + habit.name + '"';
  nombre.value = habit.name;
  tipos[habit.type - 1].checked = true;

  dias.forEach(function (diaInput) {
    diaInput.checked = false;
  });

  habit.frequency.forEach(function (dia) {
    dias[dia].checked = true;
  });

  if (habit.reminderhour != null) {
    recordatorioToggle.checked = true;
    inputRec.value =
      pad0(habit.reminderhour.toString()) +
      ":" +
      pad0(habit.reminderminute.toString());
  }
}

function pad0(numStr) {
  if (numStr.length == 1) return "0" + numStr;
  return numStr;
}
