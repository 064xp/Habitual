# Documentación Base de Datos Habitual

## Tablas

### Users

| Columna  | Tipo dato    | Opciones              |
| -------- | ------------ | --------------------- |
| userID   | SERIAL       | PRIMARY KEY, NOT NULL |
| name     | VARCHAR(100) | NOT NULL              |
| email    | VARCHAR(100) | UNIQUE, NOT NULL      |
| password | CHAR(60)     | NOT NULL              |

### HabitTypes

| Columna | Tipo dato   | Opciones              |
| ------- | ----------- | --------------------- |
| typeID  | INTEGER     | PRIMARY KEY, NOT NULL |
| name    | VARCHAR(50) | UNIQUE, NOT NULL      |
| days    | INTEGER     | UNIQUE, NOT NULL      |

### Habits

| Columna     | Tipo dato    | Opciones                                 |
| ----------- | ------------ | ---------------------------------------- |
| habitID     | SERIAL       | PRIMARY KEY, NOT NULL                    |
| userID      | INTEGER      | FOREIGN KEY Users(userID), NOT NULL      |
| name        | VARCHAR(200) | NOT NULL                                 |
| frequency   | INTEGER      | NOT NULL                                 |
| type        | INTEGER      | FOREIGN KEY HabitTypes(typeID), NOT NULL |
| startDate   | DATE         | NOT NULL                                 |
| daysPending | INTEGER      | NOT NULL                                 |

### History

| Columna  | Tipo dato | Opciones                              |
| -------- | --------- | ------------------------------------- |
| entryID  | SERIAL    | PRIMARY KEY, NOT NULL                 |
| habitID  | INTEGER   | FOREIGN KEY Habits(habitID), NOT NULL |
| dateTime | TIMESTAMP | NOT NULL                              |

---

## Procedimientos Almacenados

### insertHabit

Inserta nuevo hábito a la tabla _Habits_

**Parámetros**

| Nombre      | Tipo         | Requerido                 |
| ----------- | ------------ | ------------------------- |
| \_name      | VARCHAR(200) | Si                        |
| \_userID    | INTEGER      | Si                        |
| \_frequency | INTEGER      | Si                        |
| \_type      | INTEGER      | Si                        |
| \_startDate | DATE         | No (default fecha actual) |

**Regresa**

Notice:

- **success** Se agregó el hábito exitosamente.

Error:

- **Invalid habit type [tipo]** El tipo de hábito que se especificó es incorrecto.

<br />

### deleteHabit

Elimina un hábito por su ID de la tabla _Habits_

**Parámetros**

| Nombre    | Tipo    | Requerido |
| --------- | ------- | --------- |
| \_habitID | INTEGER | Si        |

**Regresa**

Notice:

- **success** Se eliminó el hábito exitosamente.

<br />

### updateHabit

Actualiza un hábito por su ID.

**Parámetros**

| Nombre      | Tipo         | Requerido |
| ----------- | ------------ | --------- |
| \_habitID   | INTEGER      | Si        |
| \_name      | VARCHAR(200) | Si        |
| \_frequency | INTEGER      | Si        |
| \_type      | INTEGER      | Si        |

**Regresa**

Notice:

- **success** Se actualizó el hábito exitosamente.

<br />

### insertActivity

Inserta una actividad de un hábito en la tabla _History_.

**Parámetros**

| Nombre     | Tipo      | Requerido                 |
| ---------- | --------- | ------------------------- |
| \_habitID  | INTEGER   | Si                        |
| \_dateTime | TIMESTAMP | No (default fecha actual) |

**Regresa**

Notice:

- **success** Se agregó la actividad exitosamente.

<br />

### insertUser

Inserta un usuario nuevo

**Parámetros**

| Nombre     | Tipo         | Requerido |
| ---------- | ------------ | --------- |
| \_name     | VARCHAR(100) | Si        |
| \_email    | VARCHAR(100) | Si        |
| \_password | CHAR(60)     | Si        |

**Regresa**

Notice:

- **success** Se agregó el usuario exitosamente.

Error:

- **Email is already in use** Ya existe un usuario registrado con el correo especificado.

---

## Funciones

### getUserHabits(\_userID, \_ammount)

Obtiene los hábitos de un usuario.
Por defecto obtiene los primeros 20, ordenados de más nuevo a más viejo.

**Parámetros**

| Nombre    | Tipo    | Requerido       |
| --------- | ------- | --------------- |
| \_userID  | INTEGER | Si              |
| \_ammount | INTEGER | No (default 20) |

**Regresa**
El tipo de hábito o _type_ regresa el nombre del tipo, por ejemplo _Hábito de Madera_.

| habitID | name         | frequency | type        | startDate | daysPending | totalDays |
| ------- | ------------ | --------- | ----------- | --------- | ----------- | --------- |
| INTEGER | VARCHAR(200) | INTEGER   | VARCHAR(50) | DATE      | INTEGER     | INTEGER   |

<br />

### daysPending(\_habitID)

Calcula los días pendientes de un hábito por su habitID.

**Parámetros**

| Nombre    | Tipo    | Requerido |
| --------- | ------- | --------- |
| \_habitID | INTEGER | Si        |

**Regresa**

| daysPending     |
| --------------- |
| [cantidad dias] |

---

## Triggers

### tr_updateDaysPending

Cada vez que se inserta una actividad en la tabla _History_, se actualiza la cantidad de días restantes (daysPending) de ese hábito en la tabla _Habits_
