# Documentación Base de Datos Habitual

## Tablas

### Users

| Columna  | Tipo dato    | Opciones            |
| -------- | ------------ | ------------------- |
| userID   | integer      | PRIMARY KEY, SERIAL |
| name     | varchar(100) |                     |
| email    | varchar(60)  | UNIQUE              |
| password | varchar(50)  |                     |

### HabitTypes

| Columna | Tipo dato   | Opciones    |
| ------- | ----------- | ----------- |
| typeID  | integer     | PRIMARY KEY |
| name    | varchar(50) | UNIQUE      |
| days    | integer     | unique      |

### Habits

| Columna   | Tipo dato    | Opciones                       |
| --------- | ------------ | ------------------------------ |
| habitID   | integer      | PRIMARY KEY                    |
| userID    | integer      | FOREIGN KEY Users(userID)      |
| name      | varchar(200) |                                |
| frequency | integer      |                                |
| type      | integer      | FOREIGN KEY HabitTypes(typeID) |
| startDate | date         |                                |

### History

| Columna | Tipo dato | Opciones                    |
| ------- | --------- | --------------------------- |
| entryID | integer   | PRIMARY KEY, SERIAL         |
| habitID | integer   | FOREIGN KEY Habits(habitID) |
| date    | timestamp |                             |
