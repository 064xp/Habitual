var habitosState = null;

window.addEventListener("load", function () {
  document.querySelector("#nombre-usuario").innerText = localStorage.getItem(
    "name"
  );
  document.querySelector("#fecha").innerText = conseguirFecha();

  conseguirHabitos();
});

function HabitosState(habitos) {
  //hábitos completos
  this.habitos = habitos;
  //hábitos clasificados
  this.completados = [];
  this.pendientesHoy = [];
  this.otroDia = [];
  this.completadosHoy = [];
  //métodos
  this.clasificarHabitos = clasificarHabitos;
  this.actualizarValores = actualizarValores;
  this.mostrarHabitos = mostrarHabitos;
  this.contenedores = {
    completados: document.querySelector("#completados"),
    pendientesHoy: document.querySelector("#pendientes"),
    otroDia: document.querySelector("#habitos-otro-dia"),
  };

  this.clasificarHabitos();
  this.actualizarValores();
}

function clasificarHabitos() {
  this.completados = this.habitos.filter(function (habito) {
    return habito.completed;
  });
  this.completadosHoy = this.habitos.filter(function (habito) {
    return habito.completed && habito.frequency.includes(new Date().getDay());
  });
  this.pendientesHoy = this.habitos.filter(function (habito) {
    return !habito.completed && habito.frequency.includes(new Date().getDay());
  });
  this.otroDia = this.habitos.filter(function (habito) {
    return !habito.completed && !habito.frequency.includes(new Date().getDay());
  });
}

function conseguirHabitos() {
  requests.get("/api/habits").then(function (res) {
    if (!res.ok) {
      alert("Ocurrió un error, intentelo más tarde.");
      return;
    }
    habitosState = new HabitosState(res.body.habits);
  });
}

function actualizarValores() {
  this.mostrarHabitos("pendientesHoy");
  this.mostrarHabitos("completados");
  this.mostrarHabitos("otroDia");

  const completadoNum = document.querySelector("#info_completado-num");
  const completadoPorciento = document.querySelector("#info_porcentaje-num");

  completadoNum.innerText =
    this.completadosHoy.length +
    "/" +
    (this.pendientesHoy.length + this.completadosHoy.length);

  completadoPorciento.innerText = porcentaje(
    this.completadosHoy.length,
    this.pendientesHoy.length + this.completadosHoy.length
  ).toFixed();
}

function mostrarHabitos(tipo) {
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
  for (var i = 0; i < this[tipo].length; i++) {
    var habito = this[tipo][i];
    crearElemento(this.contenedores[tipo], template, [
      habito.habitid,
      habito.habitid,
      habito.habitid,
      habito.name,
      habito.frequency.length,
    ]);
  }
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
  return (
    dias[fecha.getDay()] +
    " " +
    fecha.getDate() +
    "\n" +
    meses[fecha.getMonth()] +
    " " +
    fecha.getFullYear().toString().substring(2)
  );
}

function escapeHTML(str) {
  return new Option(str).innerHTML;
}

function porcentaje(valor, total) {
  return (valor / total) * 100;
}
