# Documentación Base de Datos Habitual

## Tablas

### Users

| Columna  | Tipo dato    | Opciones            |
| -------- | ------------ | ------------------- |
| userID   | integer      | PRIMARY KEY, SERIAL |
| name     | varchar(100) |                     |
| email    | varchar(100) | UNIQUE              |
| password | varchar(50)  |                     |

### HabitTypes

| Columna | Tipo dato   | Opciones    |
| ------- | ----------- | ----------- |
| typeID  | integer     | PRIMARY KEY |
| name    | varchar(50) | UNIQUE      |
| days    | integer     | unique      |

### Habits

| Columna     | Tipo dato    | Opciones                       |
| ----------- | ------------ | ------------------------------ |
| habitID     | integer      | PRIMARY KEY                    |
| userID      | integer      | FOREIGN KEY Users(userID)      |
| name        | varchar(200) |                                |
| frequency   | integer      |                                |
| type        | integer      | FOREIGN KEY HabitTypes(typeID) |
| startDate   | date         |                                |
| daysPending | int          |                                |

### History

| Columna | Tipo dato | Opciones                    |
| ------- | --------- | --------------------------- |
| entryID | integer   | PRIMARY KEY, SERIAL         |
| habitID | integer   | FOREIGN KEY Habits(habitID) |
| date    | timestamp |                             |

---

## Procedimientos Almacenados

### insertHabit

Inserta nuevo hábito a la tabla _Habits_

**Parámetros**

| Nombre     | Tipo         | Requerido                 |
| ---------- | ------------ | ------------------------- |
| @name      | varchar(200) | Si                        |
| @userID    | integer      | Si                        |
| @frequency | integer      | Si                        |
| @type      | integer      | Si                        |
| @startDate | date         | No (default fecha actual) |

**Regresa**

| status           | message                  |
| ---------------- | ------------------------ |
| success \| error | habitID \| error message |

### deleteHabit

Elimina un hábito por su ID de la tabla _Habits_

**Parámetros**

| Nombre   | Tipo | Requerido |
| -------- | ---- | --------- |
| @habitID | int  | Si        |

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
| @userID  | int        | Si                  |
| @ammount | int        | No (default 20)     |
| @order   | varchar(8) | No (default newest) |

**Regresa**
El tipo de hábito o _type_ regresa el nombre del tipo, por ejemplo _Hábito de Madera_.

| habitID | name         | frequency | type        | startDate | daysPending | totalDays |
| ------- | ------------ | --------- | ----------- | --------- | ----------- | --------- |
| int     | varchar(200) | int       | varchar(50) | date      | int         | int       |

### updateHabit

Actualiza un hábito por su ID.

**Parámetros**

| Nombre     | Tipo         | Requerido |
| ---------- | ------------ | --------- |
| @habitID   | int          | Si        |
| @name      | varchar(200) | Si        |
| @userID    | integer      | Si        |
| @frequency | integer      | Si        |
| @type      | integer      | Si        |

**Regresa**

| status           | message                  |
| ---------------- | ------------------------ |
| success \| error | habitID \| error message |

### insertActivity

Inserta una actividad de un hábito en la tabla _History_.

**Parámetros**

| Nombre   | Tipo     | Requerido                 |
| -------- | -------- | ------------------------- |
| @habitID | int      | Si                        |
| @date    | datetime | No (default fecha actual) |

**Regresa**

| status           | message                  |
| ---------------- | ------------------------ |
| success \| error | habitID \| error message |

### insertUser

Inserta un usuario nuevo

**Parámetros**

| Nombre    | Tipo         | Requerido |
| --------- | ------------ | --------- |
| @name     | varchar(100) | Si        |
| @email    | varchar(100) | Si        |
| @password | varchar(50)  | Si        |

**Regresa**

| status           | message                  |
| ---------------- | ------------------------ |
| success \| error | habitID \| error message |

---

## Funciones

### daysPending()

Calcula los días pendientes de un hábito por su habitID.

**Parámetros**

| Nombre   | Tipo | Requerido |
| -------- | ---- | --------- |
| @habitID | int  | Si        |

**Regresa**

| daysPending     |
| --------------- |
| [cantidad dias] |

---

## Triggers

### tr_updateDaysPending

Cada vez que se inserta una actividad en la tabla _History_, se actualiza la cantidad de días restantes (daysPending) de ese hábito en la tabla _Habits_
