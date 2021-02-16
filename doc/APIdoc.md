# Habitual REST API Documentación

---

## Rutas CRUD de Hábitos

### GET /habits

**Descripción:** Regresa los hábitos del usuario autenticado.

#### Parámetros

| Nombre               | Descripción                        | Tipo   | Opciones        | Default |
| -------------------- | ---------------------------------- | ------ | --------------- | ------- |
| **auth (requerido)** | Session ID del usuario autenticado | string |                 |
| **ammount**          | Cantidad de hábitos a regresar.    | int    | [número min. 1] | 15      |

### POST /habits/new

**Descripción:** Crear nuevo hábito.

#### Parámetros

| Nombre                    | Descripción                                      | Tipo   | Opciones                   |
| ------------------------- | ------------------------------------------------ | ------ | -------------------------- |
| **auth(requerido)**       | Session ID del usuario autenticado               | string |
| **name (requerido)**      | Nombre del nuevo habito                          | string |
| **type (requerido)**      | Tipo de hábito                                   | string | 'madera', 'piedra','acero' |
| **frequency (requerido)** | Frecuencia Semanal del hábito                    | int    | número min. 1              |
| **reminder (requerido)**  | Hora del día a la cual se quiere el recordatorio | string | Hora formato 'HH:MM'       |

### PUT /habits/<habitID>

**Descripción:** Actualizar los datos de un hábito existente.

#### Parámetros

| Nombre                    | Descripción                                      | Tipo   | Opciones                   |
| ------------------------- | ------------------------------------------------ | ------ | -------------------------- |
| **auth(requerido)**       | Session ID del usuario autenticado               | string |
| **habitID (requerido)**   | ID del hábito que se va a a modificar            | string |
| **name (requerido)**      | Nombre del habito                                | string |
| **type (requerido)**      | Tipo de hábito                                   | string | 'madera', 'piedra','acero' |
| **frequency (requerido)** | Frecuencia Semanal del hábito                    | int    | número min. 1              |
| **reminder (requerido)**  | Hora del día a la cual se quiere el recordatorio | string | Hora formato 'HH:MM'       |

### DELETE /habits/<habitID>

**Descripción:** Elimina un hábito por ID.

#### Parámetros

| Nombre                  | Descripción                          | Tipo   |
| ----------------------- | ------------------------------------ | ------ |
| **auth(requerido)**     | Session ID del usuario autenticado   | string |
| **habitID (requerido)** | ID del hábito que se va a a eliminar | string |

## Rutas Manejo de Usuarios

### POST /signup

**Descripción:** Crea un nuevo usuario con el username y contraseña dadas.

#### Parámetros

| Nombre       | Descripción                    | Tipo   | Formato         |
| ------------ | ------------------------------ | ------ | --------------- |
| **username** | Nombre de usuario              | string | 3-20 caracteres |
| **password** | Contraseña                     | string | 8-35 caracteres |
| **email**    | Correo electrónico del usuario | string |

### POST /login

**Descripción:** Inicia sesión y autentica al usuario. Regresa una cookie de autenticación.

#### Parámetros

| Nombre       | Descripción       | Tipo   | Formato         |
| ------------ | ----------------- | ------ | --------------- |
| **username** | Nombre de usuario | string | 3-20 caracteres |
| **password** | Contraseña        | string | 8-35 caracteres |

### POST /logout

**Descripción:** Cierra sesión y elimina cookie de autenticación.

#### Parámetros

| Nombre   | Descripción | Tipo   |
| -------- | ----------- | ------ |
| **auth** | Session ID  | string |
