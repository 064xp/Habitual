requests.customHeaders.tz_offset = new Date().getTimezoneOffset();

window.addEventListener("load", function () {
  document.querySelector("#habito-form").addEventListener("submit", onSubmit);

  if (site == "auth_editarHabito") {
    //Obtener datos de habito por su ID y rellenar campos
    var habitID = getParam("habitID");
    if (!habitID) window.location = "/dashboard.html";
    requests.get("/api/habits/" + habitID).then(function (res) {
      if (!res.ok) {
        alert("Ocurrio un error, intentalo mas tarde");
        window.location = "/dashboard.html";
      }
      rellenarCampos(res.body.habit);
    });

    //Event listener para eliminar hábito
    document
      .querySelector("#btn-eliminar")
      .addEventListener("click", function () {
        eliminarHabito(habitID);
      });
  }
});

function onSubmit(e) {
  e.preventDefault();
  var form = e.target;
  var dias = null;
  var frecError = document.querySelector("#error-frecuencia");

  frecError.classList.add("hide");

  dias = getDias(form.diasRec, frecError);
  if (!dias) return;

  var data = {
    name: form.nombre.value,
    type: parseInt(form.tipo.value),
    frequency: dias,
    reminder: form.recordar.checked
      ? stringToTime(form.recordatorio.value)
      : null,
  };

  if (site == "auth_nuevoHabito") {
    requests.post("/api/habits/new", data).then(function (res) {
      if (res.ok) {
        alert("Agregado correctamente");
        window.location = "/dashboard.html";
      } else {
        alert(res.body.error);
      }
    });
  } else if (site == "auth_editarHabito") {
    requests
      .put("/api/habits/update/" + getParam("habitID"), data)
      .then(function (res) {
        if (res.ok) {
          alert("Modificado correctamente");
          window.location = "/dashboard.html";
        } else {
          alert(res.body.error);
        }
      });
  }
}

function pad0(numStr) {
  if (numStr.length == 1) return "0" + numStr;
  return numStr;
}

function timeToString(timeArr) {
  return pad0(timeArr[0].toString()) + ":" + pad0(timeArr[1].toString());
}

function stringToTime(timeStr) {
  return timeStr.split(":").map((t) => parseInt(t));
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

  recordatorioToggle.checked = false;
  if (habit.reminderhour != null) {
    recordatorioToggle.checked = true;
    inputRec.value = timeToString([habit.reminderhour, habit.reminderminute]);
  }
}

function eliminarHabito(habitID) {
  const confirmacion = confirm("¿Realmente quieres eliminar este hábito?");
  if (confirmacion) {
    requests.delete("/api/habits/" + habitID).then(function (res) {
      if (!res.ok) alert("Ocurrió un error, intentalo más tarde");
      else alert("El hábito se eliminó correctamente");
      window.location = "/dashboard.html";
    });
  }
}
