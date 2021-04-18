requests.customHeaders.tz_offset = new Date().getTimezoneOffset();

window.addEventListener("load", function () {
  document.querySelector("#habito-form").addEventListener("submit", onSubmit);

  const recordatorioToggle = document.querySelector("#recordatorio-toggle");

  recordatorioToggle.addEventListener("change", function () {
    if (this.checked && !getTokenSent()) pedirPermisoNotificar();
  });

  if (site == "auth_editarHabito") {
    //Obtener datos de habito por su ID y rellenar campos
    var habitID = getParam("habitID");
    if (!habitID) window.location = "/dashboard.html";
    requests.get("/api/habits/" + habitID).then(function (res) {
      if (!res.ok) {
        alertError("Ocurrio un error");
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
      if (res.ok) alertRedirect("El hábito se agregó correctamente");
      else alertError("Ocurrió un error al intentar agregar el hábito.");
    });
  } else if (site == "auth_editarHabito") {
    requests
      .put("/api/habits/update/" + getParam("habitID"), data)
      .then(function (res) {
        if (res.ok) alertRedirect("El hábito se modificó correctamente");
        else alertError("Ocurrió un error modificar el hábito.");
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
  swal({
    title: "¿Realmente quieres eliminar este hábito?",
    text: "Una vez eliminado, no será posible recuperarlo.",
    icon: "warning",
    buttons: true,
    dangerMode: true,
  }).then((confirmacion) => {
    if (confirmacion) {
      requests.delete("/api/habits/" + habitID).then(function (res) {
        if (!res.ok) alertError("Ocurrió un error el eliminar el hábito.");
        else alertRedirect("El hábito se eliminó correctamente");
      });
    }
  });
}

function alertRedirect(titulo) {
  swal({
    title: titulo,
    icon: "success",
  });
  setTimeout(function () {
    window.location = "dashboard.html";
  }, 1500);
}

function alertError(titulo, texto = "Intenta de nuevo más tarde") {
  swal({
    title: titulo,
    text: texto,
    icon: "error",
    button: "OK",
  }).then(function () {
    window.location = "dashboard.html";
  });
}
