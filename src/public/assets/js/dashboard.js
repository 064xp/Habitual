window.addEventListener("load", function () {
  document.querySelector("#nombre-usuario").innerText = localStorage.getItem(
    "name"
  );
  var fecha = conseguirFecha();
  document.querySelector("#fecha").innerText = fecha[0] + "\n" + fecha[1];

  conseguirHabitos();
});

function conseguirHabitos() {
  requests.get("/api/habits").then(function (res) {
    if (!res.ok) {
      alert("Ocurrió un error, intentelo más tarde.");
      return;
    }
    actualizarValores(res.body.habits);
  });
}

function actualizarValores(habitos) {
  var c = clasificarHabitos(habitos);
  mostrarHabitos(c.pendientesHoy, "pendientes");
  mostrarHabitos(c.completados, "completados");
  mostrarHabitos(c.habitosOtroDia, "otroDia");

  const completadoNum = document.querySelector("#info_completado-num");
  const completadoPorciento = document.querySelector("#info_porcentaje-num");

  completadoNum.innerText =
    c.completadosHoy.length +
    "/" +
    (c.pendientesHoy.length + c.completadosHoy.length);

  completadoPorciento.innerText = porcentaje(
    c.completadosHoy.length,
    c.pendientesHoy.length + c.completadosHoy.length
  ).toFixed();
}

function clasificarHabitos(habitos) {
  var res = {};
  res.completados = habitos.filter(function (habito) {
    return habito.completed;
  });
  res.completadosHoy = habitos.filter(function (habito) {
    return habito.completed && habito.frequency.includes(new Date().getDay());
  });
  res.pendientesHoy = habitos.filter(function (habito) {
    return !habito.completed && habito.frequency.includes(new Date().getDay());
  });
  res.habitosOtroDia = habitos.filter(function (habito) {
    return !habito.completed && !habito.frequency.includes(new Date().getDay());
  });
  return res;
}

function mostrarHabitos(habitos, tipo) {
  let cont = "";
  switch (tipo) {
    case "pendientes":
      cont = document.querySelector("#pendientes");
      break;
    case "completados":
      cont = document.querySelector("#completados");
      break;
    case "otroDia":
      cont = document.querySelector("#habitos-otro-dia");
      break;
  }
  const template = `
  <div class="actividad ${tipo == "completados" ? "actividad_terminado" : ""}">
    <input
      type="checkbox"
      name="Pendiente"
      class="Habito_Check"
      id="habito_{{}}"
      ${tipo == "completados" ? "checked" : ""}
      data-habitid={{}}
    />
    <label for="habito_{{}}" class="Habito_Check_Label"></label>
    <div class="info_actividad">
      <h3>{{}}</h3>
      <p>{{}} veces por semana</p>
    </div>
  </div>
  `;
  habitos.forEach(function (habito) {
    crearElemento(cont, template, [
      habito.habitid,
      habito.habitid,
      habito.habitid,
      habito.name,
      habito.frequency.length,
    ]);
  });
}

function crearElemento(padre, str, valores) {
  valores.forEach(function (val) {
    str = str.replace("{{}}", escapeHTML(val));
  });
  padre.innerHTML += str;
  return str;
}

function conseguirFecha() {
  //prettier-ignore
  const dias = ['Domingo','Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  //prettier-ignore
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  var fecha = new Date();
  return [
    dias[fecha.getDay()] + " " + fecha.getDate(),
    meses[fecha.getMonth()] + " " + fecha.getFullYear().toString().substring(2),
  ];
}

function escapeHTML(str) {
  return new Option(str).innerHTML;
}

function porcentaje(valor, total) {
  return (valor / total) * 100;
}
