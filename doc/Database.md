# Documentación Base de Datos Habitual

## Tablas

### Users

| Columna  | Tipo dato    | Opciones              |
| -------- | ------------ | --------------------- |
| userID   | SERIAL       | PRIMARY KEY, NOT NULL |
| name     | VARCHAR(100) | NOT NULL              |
| email    | VARCHAR(100) | UNIQUE, NOT NULL      |
| password | VARCHAR(50)  | NOT NULL              |

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

| Nombre     | Tipo         | Requerido                 |
| ---------- | ------------ | ------------------------- |
| @name      | VARCHAR(200) | Si                        |
| @userID    | INTEGER      | Si                        |
| @frequency | INTEGER      | Si                        |
| @type      | INTEGER      | Si                        |
| @startDate | DATE         | No (default fecha actual) |

**Regresa**

| status           | message                  |
| ---------------- | ------------------------ |
| success \| error | habitID \| error message |

### deleteHabit

Elimina un hábito por su ID de la tabla _Habits_

**Parámetros**

| Nombre   | Tipo    | Requerido |
| -------- | ------- | --------- |
| @habitID | INTEGER | Si        |

**Regresa**

| status           | message                  |
| ---------------- | ------------------------ |
| success \| error | habitID \| error message |

### getUserHabits

Obtiene los hábitos de un usuario.
Por defecto obtiene los primeros 20, ordenados de más nuevo a más viejo.

**Parámetros**

| Nombre   | Tipo       | Requerido           |
| -------- | ---------- | ------------------- |
| @userID  | INTEGER    | Si                  |
| @ammount | INTEGER    | No (default 20)     |
| @order   | VARCHAR(8) | No (default newest) |

**Regresa**
El tipo de hábito o _type_ regresa el nombre del tipo, por ejemplo _Hábito de Madera_.

| habitID | name         | frequency | type        | startDate | daysPending | totalDays |
| ------- | ------------ | --------- | ----------- | --------- | ----------- | --------- |
| INTEGER | VARCHAR(200) | INTEGER   | VARCHAR(50) | DATE      | INTEGER     | INTEGER   |

### updateHabit

Actualiza un hábito por su ID.

**Parámetros**

| Nombre     | Tipo         | Requerido |
| ---------- | ------------ | --------- |
| @habitID   | INTEGER      | Si        |
| @name      | VARCHAR(200) | Si        |
| @userID    | INTEGER      | Si        |
| @frequency | INTEGER      | Si        |
| @type      | INTEGER      | Si        |

**Regresa**

| status           | message                  |
| ---------------- | ------------------------ |
| success \| error | habitID \| error message |

### insertActivity

Inserta una actividad de un hábito en la tabla _History_.

**Parámetros**

| Nombre    | Tipo      | Requerido                 |
| --------- | --------- | ------------------------- |
| @habitID  | INTEGER   | Si                        |
| @dateTime | TIMESTAMP | No (default fecha actual) |

**Regresa**

| status           | message                  |
| ---------------- | ------------------------ |
| success \| error | habitID \| error message |

<br />

### insertUser

Inserta un usuario nuevo

**Parámetros**

| Nombre    | Tipo         | Requerido |
| --------- | ------------ | --------- |
| @name     | VARCHAR(100) | Si        |
| @email    | VARCHAR(100) | Si        |
| @password | VARCHAR(50)  | Si        |

**Regresa**

| status           | message                  |
| ---------------- | ------------------------ |
| success \| error | habitID \| error message |

---

## Funciones

### daysPending()

Calcula los días pendientes de un hábito por su habitID.

**Parámetros**

| Nombre   | Tipo    | Requerido |
| -------- | ------- | --------- |
| @habitID | INTEGER | Si        |

**Regresa**

| daysPending     |
| --------------- |
| [cantidad dias] |

---

## Triggers

### tr_updateDaysPending

Cada vez que se inserta una actividad en la tabla _History_, se actualiza la cantidad de días restantes (daysPending) de ese hábito en la tabla _Habits_
