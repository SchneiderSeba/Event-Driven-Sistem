## Monolite – Guía para el Agente de IA

Este documento define **cómo está organizado el proyecto** y **cómo deberías razonar** al dar sugerencias o proponer cambios.

---

## 1. Visión general de la arquitectura

- **Tipo de app**: API HTTP con `express` que actúa como fachada monolítica.
- **Persistencia**: delegada a un **json-server** (script `npm run server`) que expone `db.json` como un POS/sistema externo.
- **Patrón principal**:
  - `index.js` expone endpoints HTTP.
  - `src/Routes/router.js` contiene *routers funcionales* por dominio (Products, Orders, Payments, Clients, Auth).
  - Cada router delega en un **Driver** de su feature (`src/Products/ProductsDriver.js`, `src/Orders/OrdersDriver.js`, etc.).
  - La validación de datos se hace con **Zod DTOs** en `src/Models`.

Cuando sugieras cambios, **respeta siempre este flujo**:
`Express route (index.js) -> Router (src/Routes/router.js) -> Driver (src/<Feature>/*Driver.js) -> POS/json-server (db.json vía axios)`  
Más validaciones van en **DTOs** y **schemas Zod**, no mezcladas en los controladores.

---

## 2. Estructura de carpetas y responsabilidades

- **Raíz del proyecto**
  - `index.js`: punto de entrada de Express. Aquí solo:
    - Configurar middlewares (`cors`, `express.json`).
    - Definir endpoints y delegar en routers (no poner lógica de negocio).
    - Arrancar el servidor y exponer `/`, `/health` y las rutas de dominio.
  - `db.json`: base de datos simulada que alimenta `json-server` (**no modificar estructura sin actualizar DTOs**).
  - `package.json`: dependencias y scripts (`dev`, `start`, `server`).
  - `AGENT.md`: este documento (mantenerlo sincronizado si cambia la arquitectura).

- **`src/Routes/router.js`**
  - Define routers **funcionales**:
    - `ProductRouter`
    - `OrdersRouter`
    - `LoginRouter`
    - `SigninRouter`
    - `PaymentRouter`
    - `ClientsRouter`
  - Cada router:
    - Recibe `{ path, method, body }`.
    - Matchea rutas y métodos con `if / else if`.
    - Llama funciones de los drivers de cada feature.
    - Devuelve `{ status, body }` (donde `body` ya es `JSON.stringify(...)`).
  - **Regla para sugerencias**:
    - No introducir lógica de negocio aqui.
    - Mantener este archivo como capa de **routing y orquestación ligera**.

- **`src/Products/ProductsDriver.js`**
  - Funciones: `createProduct`, `getAllProducts`, `getProductById`, `updateProductById`, `deleteProductById`.
  - Uso principal: CRUD de productos a través de `axios` hacia `json-server`.
  - Valida entrada con `productSchema` (Zod).
  - **Regla**: si se agrega lógica de negocio de productos (descuentos, stock, etc.), ponerla aquí o en helpers específicos de productos, nunca en `router.js` ni en `index.js`.

- **`src/Orders/OrdersDriver.js`**
  - Funciones: `createOrder`, `getAllOrders`, `getOrderById`, `updateOrderById`, `deleteOrderById`.
  - Maneja órdenes y se conecta a `http://localhost:8000/orders`.
  - Valida con `orderSchema` antes de crear órdenes.
  - **Regla**: cualquier nueva lógica de estados de órdenes (ej: `pending`, `paid`, `cancelled`) debe implementarse aquí.

- **`src/Clients/ClientsDriven.js`**
  - Funciones: `allClients`, `getClientById`, `createClient`, `deleteClientById`, `updateClientById`.
  - Usa `clientSchema` para validar.
  - Trabaja con `clientId` (propiedad de negocio) y el `id` interno de `json-server`.
  - **Regla**: si se necesita más información de clientes (dirección, documento, etc.), actualizar primero `clientSchema` y luego las funciones de este driver.

- **`src/Payments/PaymentDriven.js`**
  - Funciones:
    - `validatePaymentData` / `PaymentsDTO` (validación conceptual).
    - `allPayments` (lee pagos del POS/json-server).
    - `PaymentIntentMP` (integra con Mercado Pago, usando `MP_ACCESS_TOKEN` y `mercadopago`).
    - `PaymentIntentPOS` (registra un intento de pago POS en `json-server`).
  - **Regla**:
    - Mantener aquí toda integración con sistemas de pagos.
    - Si se agregan nuevos proveedores (ej: Stripe, otro POS), crear nuevas funciones en este archivo o un nuevo driver específico para ese proveedor.

- **`src/Auth`**
  - `AuthDriver.js`:
    - `generateToken(user)`: crea JWT con `JWT_SECRET` y expiración de 1h.
    - `verifyToken(token)`: valida JWT.
    - `revokeToken(user)`: registra token revocado en `trashTokens` y limpia el usuario en `users`.
    - `cleanExpiredTokens()`: recorre usuarios desde `/users` y revoca tokens expirados.
  - `LogIn.js`:
    - Define `loginInSchema` (Zod).
    - `LogIn(email, password)`: valida credenciales contra `json-server`, compara con `bcrypt`, genera y persiste `token` si no existe.
  - `SignIn.js`:
    - Define `signInSchema`.
    - `SignIn(email, password)`: crea usuario nuevo con `id`, `token` inicial y contraseña hasheada (`SALT_ROUNDS`).
  - **Regla**:
    - Toda lógica de autenticación/JWT va en esta carpeta.
    - Si se agregan middlewares de autenticación, hacerlo como funciones reutilizables que usen `verifyToken` (no duplicar lógica en routes).

- **`src/Models`**
  - `ClientDTO.js`: `clientSchema`.
  - `OrderDTO.js`: `orderSchema`.
  - `ProductDTO.js`: `productSchema`.
  - `PaymentsDTO.js`: `PaymentsDTO`.
  - **Regla clave**: cualquier cambio en la forma de los datos en `db.json` o en las requests/responses **debe reflejarse primero aquí** (Zod como fuente de verdad).

---

## 3. Convenciones para nuevas features o módulos

Cuando el agente sugiera o implemente una nueva feature, debe seguir este patrón:

- **1. Crear DTO/Schema** en `src/Models`:
  - Definir un `z.object({...})` con las validaciones y tipos.
  - Mantener nombres consistentes (`<Feature>DTO` o `<feature>Schema`).

- **2. Crear Driver de dominio** en `src/<Feature>/<Feature>Driver.js`:
  - Encapsular aquí:
    - Llamadas HTTP con `axios` hacia `json-server` u otros servicios.
    - Lógica de negocio específica del dominio.
  - No usar `express` ni objetos `req/res` en los drivers (drivers deben ser puros respecto al transporte).

- **3. Exponer rutas en `src/Routes/router.js`**:
  - Añadir una nueva función `XRouter` **solo si es un nuevo agregado de dominio completo**.
  - Si es un simple endpoint extra de un dominio existente, extender el router existente (ej. nuevas combinaciones path/method).

- **4. Conectar desde `index.js`**:
  - Usar `app.all`, `app.get`, `app.post`, etc., pasando `{ path, method, body: JSON.stringify(req.body) }` al router.
  - Nunca llamar drivers directamente desde `index.js`.

---

## 4. Uso de herramientas y dependencias

- **Express**:
  - Usar solo en `index.js` (o, si se amplía, en archivos de entrada muy delgados).
  - No mezclar `req`/`res` con lógica de negocio.

- **Axios**:
  - Úsalo en drivers para simular/integrar con el POS (`json-server` en `http://localhost:8000`).
  - Mantener URLs base y paths lo más centralizados/claros posible.

- **Zod**:
  - Validar siempre `data` de entrada antes de persistir o procesar.
  - Si aparece un error de esquema, preferir ajustar el esquema antes de “relajar” validaciones sin motivo.

- **JWT / Auth**:
  - Usar `generateToken`, `verifyToken`, `revokeToken` desde `AuthDriver`.
  - Sugerir siempre el uso de variables de entorno (`JWT_SECRET`, `MP_ACCESS_TOKEN`, `SALT_ROUNDS`) y no hardcodear secretos.

- **json-server**:
  - Se asume corriendo con `npm run server` (**no modificar scripts sin avisar**).
  - `db.json` puede cambiar, pero el agente debe tener en cuenta que **DTOs deben actualizarse en paralelo**.

---

## 5. Estilo y buenas prácticas para sugerencias del agente

- **Separación de capas**:
  - Mantener `index.js` como capa de entrada HTTP.
  - Mantener `router.js` como capa de routing/orquestación.
  - Mantener drivers como capa de negocio/integración.
  - Mantener DTOs como fuente de verdad de los datos.

- **Ergonomía de código**:
  - Preferir funciones puras donde sea posible.
  - Añadir logs útiles pero no ruidosos (ej. en integraciones externas o puntos críticos).

- **Evolución del proyecto**:
  - Si se propone refactorizar a arquitectura más modular (por ejemplo, separar módulos, middlewares reutilizables o tests), hacerlo **paso a paso**, respetando primero el diseño actual y luego proponiendo mejoras claras.

---

## 6. Cómo debe pensar el agente al responder

Cuando des sugerencias o escribas código para este proyecto:

- **1. Identifica la capa correcta**:
  - ¿Es un cambio de datos? → `src/Models`.
  - ¿Es lógica de negocio de un dominio? → Driver del dominio.
  - ¿Es una ruta nueva o cambio de endpoint? → `src/Routes/router.js` + `index.js`.
  - ¿Es autenticación/autorización? → `src/Auth`.

- **2. Verifica siempre consistencia con `db.json`**:
  - Si propones nuevos campos en productos/órdenes/usuarios/pagos, asumir que `db.json` y el DTO correspondiente deben actualizarse juntos.

- **3. Mantén coherencia con lo existente**:
  - Reutiliza patrones ya usados (por ejemplo, cómo se crean IDs con `randomUUID`, cómo se usan `axios` y Zod).
  - Evita introducir estilos totalmente diferentes sin justificación.

Con estas reglas, el agente debería poder entender rápidamente **dónde tocar qué cosa** y cómo proponer cambios que encajen de forma natural en el proyecto.

