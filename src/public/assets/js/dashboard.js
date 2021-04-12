window.addEventListener("load", function () {
  document.querySelector("#nombre-usuario").innerText = localStorage.getItem(
    "name"
  );
  var fecha = conseguirFecha();
  document.querySelector("#fecha").innerText = fecha[0] + "\n" + fecha[1];

  conseguirHabitos();
});

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

function conseguirHabitos() {
  requests.get("/api/habits").then(function (res) {
    if (!res.ok) {
      alert("Ocurrió un error, intentelo más tarde.");
      return;
    }
    console.log(res.body);
    var completados = res.body.habits.filter(function (habito) {
      return habito.completed;
    });
    var pendientes = res.body.habits.filter(function (habito) {
      return !habito.completed;
    });
    mostrarHabitos(pendientes);
    mostrarHabitos(completados, true);
  });
}

function mostrarHabitos(habitos, completado = false) {
  const cont = completado
    ? document.querySelector("#completados")
    : document.querySelector("#pendientes");
  const template = `
  <div class="actividad ${completado ? "actividad_terminado" : null}">
    <input
      type="checkbox"
      name="Pendiente"
      id="habito_{{}}"
      class="Habito_Check"
      ${completado ? "checked" : null}
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

function escapeHTML(str) {
  return new Option(str).innerHTML;
}
