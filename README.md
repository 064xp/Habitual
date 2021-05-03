
<h1 align="center">
  <br>
  <a href="https://github.com/064xp/Habitual"><img src="images/habitual-logo.svg" alt="Habitual" width="200"></a>
  <br>
  Habitual
  <br>
</h1>

<h4 align="center">Rastreador de hábitos para ayudarte a formar hábitos y cumplir tus metas.</h4>

<h2 align="center" style="margin-top: 0;"><a href="https://habitual-tracker.herokuapp.com/">Ver demo</a></h2>
<p align="center">
  <a href="#descripción">Descripción</a> •
  <a href="#tecnologías">Tecnologías</a> •
  <a href="#correr-localmente">Correr Localmente</a> •
  <a href="#licencia">Licencia</a>

</p>

<h3 align="center">
  <img src="images/demo.gif" width: 200px;"/>
</h3>

## Descripción

Habitual es un rastreador de hábitos que te ayuda a ser constante al intentar formar nuevos hábitos.

### ¿Cómo funciona?
Comienzas por agregar un nuevo hábito, aqui puedes especificar el nombre del mismo, el tipo de hábito (cuántos días consecutivos debes cumplir para considerarlos completado), los días de la semana que quieres realizar esta actividad y un recordatorio opcional.

Los tipos de hábitos son:
- **Hábito de Madera:** 18 días consecutivos.
- **Hábito de Piedra:** 66 días consecutivos.
- **Hábito de Acero:** 254 días consecutivos.

Para registrar una activdad, presionas sobre el circulo blanco del lado izquierdo del hábito.

Debes realizar la actividad los días que especificaste para no perder tu racha, de no hacerlo, se marcará la actividad como fuera de tiempo y la siguiente vez que se registre una actividad, se reiniciará la racha de días seguidos.

Si programaste recordatorios, Habitual te enviará recordatorios para dicha actividad los días que especificaste para esa actividad a la hora registrada.

## Tecnologías

### Frontend
En cuanto a frontend, habitual está desarrollado con HTML, CSS y JS vainilla. Nada de frameworks :)

La única librería utilizada es [Sweetalert](https://sweetalert.js.org/) para las alertas.

### Backend
El backend está hecho con [expressjs](http://expressjs.com/), la autenticación es en base a [JSON Web Tokens](https://jwt.io/), almacenando el token en una cookie.

Para el sistema de **notificaciones** se está utilizando [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging/).

### Base de Datos
Como base de datos se utilizó [Postgres](https://www.postgresql.org/)

## Correr Localmente

Para correr esta aplcación localmente, necesitarás [Git](https://git-scm.com), [Node.js](https://nodejs.org/en/download/) y [PostgreSQL](https://www.postgresql.org/) instalado.

```bash
# Clonar este repositorio
$ git clone https://github.com/064xp/Habitual

```
### Crear la base de datos
Puedes crear la base de datos mediante la interfaz gráfica [PgAdmin](https://www.pgadmin.org/). Una vez creada, selecciona la base de datos y corre el script ubicado en `databaseScripts/databaseCreation.sql`.

#### psql
Si deseas crear la base de datos mediante la linea de comandos
```
$ sudo su - postgres
$ createdb habitual
$ psql

psql> \c habitual
psql> \i /ruta/a/script/databaseCreation.sql
```

### Crear un archivo .env
Debes crear un archivo con las variables de entorno en `/src/.env`

El contenido deberá seguir el siguiente formato

```
DATABASE_URL=postgres://habitualUser:habitual@localhost:5432/habitual
JWT_SECRET=StringAleatorio(puedesDejarloAsi)
NODE_ENV=debug
PORT=3000
```

### Firebase Cloud Messaging
Crea un nuevo proyecto en firebase y habilita Firebase Cloud Messaging.
Navega a las configuraciones del proyecto y en la pestaña de "Service Accounts" descargar las credenciales (es un archivo JSON).

Este archivo lo debes poner en `/src/firebase/creds/firebase-admin-creds.json`

### Correr el servidor
```
# Entrar al directorio
$ cd Habitual/src

# Instalar las dependencias
$ npm install

# Correr la aplicación
$ npm start
```

En tu navegador, ir a [localhost:3001](localhost:3001)

## Licencia

GPL-3.0
