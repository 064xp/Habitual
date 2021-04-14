requests.customHeaders.tz_offset = new Date().getTimezoneOffset();
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
  this.agregarActividad = agregarActividad;
  this.eliminarActividad = eliminarActividad;
  this.agregarListenersCheck = agregarListenersCheck;
  //Contenedores para los hábitos
  this.contenedores = {
    completados: document.querySelector("#completados"),
    pendientesHoy: document.querySelector("#pendientes"),
    otroDia: document.querySelector("#habitos-otro-dia"),
  };

  this.actualizarValores();
}

//Definición de métodos
function clasificarHabitos() {
  this.completados = this.habitos.filter(function (habito) {
    return habito.donetoday;
  });
  this.completadosHoy = this.habitos.filter(function (habito) {
    return habito.donetoday && habito.frequency.includes(new Date().getDay());
  });
  this.pendientesHoy = this.habitos.filter(function (habito) {
    return !habito.donetoday && habito.frequency.includes(new Date().getDay());
  });
  this.otroDia = this.habitos.filter(function (habito) {
    return !habito.donetoday && !habito.frequency.includes(new Date().getDay());
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
  this.clasificarHabitos();
  this.mostrarHabitos("pendientesHoy");
  this.mostrarHabitos("completados");
  this.mostrarHabitos("otroDia");
  this.agregarListenersCheck();

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
  <a href="/editarHabito.html?habitID={{1}}" class="habito-link">
    <div class="actividad
      ${tipo == "completados" ? "habito-terminado " : ""}
      {{2}}
    ">
      <input
        type="checkbox"
        name="Pendiente"
        class="Habito_Check"
        id="habito_{{1}}"
        ${tipo == "completados" ? "checked" : ""}
        data-habitid={{1}}
      />
      <label for="habito_{{1}}" class="Habito_Check_Label"></label>
      <div class="info_actividad">
        <h3>{{3}}</h3>
        <div class="habito-semana">
          {{4}}
        </div>
      </div>
      <div class="habito-dias-cont">
        <div>
          <span class="habito-dias-num">{{5}}</span>/{{6}}
        </div>
      </div>
    </div>
  </a>
  `;
  this.contenedores[tipo].innerHTML = "";
  for (var i = 0; i < this[tipo].length; i++) {
    var habito = this[tipo][i];
    var clases = "";
    clases += habito.isoverdue ? "habito-vencido " : "";
    clases += habito.dayspending == 0 ? "habito-completado " : "";

    crearElemento(this.contenedores[tipo], template, [
      habito.habitid,
      clases,
      habito.name,
      generarSemana(habito),
      habito.totaldays - habito.dayspending,
      habito.totaldays,
    ]);
  }
}

function agregarActividad(habitID) {
  requests.post("/api/activities/new", { habitID: habitID }).then(
    function (res) {
      if (!res.ok) {
        alert("Ocurrió un error, intenta más tarde");
        return;
      }
      var habito = this.habitos.find(function (habito) {
        return habito.habitid == habitID;
      });
      habito.donetoday = true;
      habito.isoverdue = false;
      habito.dayspending -= 1;

      this.actualizarValores();
    }.bind(this)
  );
}

function eliminarActividad(habitID) {
  requests.delete("/api/activities/delete", { habitID: habitID }).then(
    function (res) {
      if (!res.ok) {
        alert("Ocurrió un error, intenta más tarde");
        return;
      }
      var habito = this.habitos.find(function (habito) {
        return habito.habitid == habitID;
      });
      habito.donetoday = false;
      habito.dayspending += 1;

      this.actualizarValores();
    }.bind(this)
  );
}

function agregarListenersCheck() {
  const habitoChecks = document.querySelectorAll(".Habito_Check");

  for (var i = 0; i < habitoChecks.length; i++) {
    var checkEl = habitoChecks[i];

    checkEl.addEventListener(
      "change",
      function (e) {
        if (e.target.checked) this.agregarActividad(e.target.dataset.habitid);
        else this.eliminarActividad(e.target.dataset.habitid);
      }.bind(this)
    );
  }
}

function generarSemana(habito) {
  var diasSemana = ["L", "M", "Mi", "J", "V", "S", "D"];
  var html = "";
  for (var i = 0; i < diasSemana.length; i++) {
    var freqDia = i == 6 ? 0 : i + 1;
    html += `<span
    ${habito.frequency.includes(freqDia) ? 'class="dia-semana_sel"' : ""}
    >
    ${diasSemana[i]}
    </span>
    `;
  }
  return html;
}

//Funciones de ayuda generales
function crearElemento(padre, str, valores) {
  valores.forEach((valor, index) => {
    var findStr = "{{" + (index + 1) + "}}";
    str = str.replaceAll(findStr, valor);
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
  var porcentaje = (valor / total) * 100;
  return isNaN(porcentaje) ? 0 : porcentaje;
}
