# DemoEnllacDigital

Aplicación demo/public + panel admin para demos B2B, preparada para integración robusta con `enllac-agent`.

## Arranque local

```bash
npm install
npm run dev
```

Variables mínimas:

```bash
VITE_BASE44_APP_ID=...
VITE_BASE44_APP_BASE_URL=...
```

## Selección de sector y cliente demo

### URLs soportadas
- `/demo`
- `/demo/:sector`
- `/demo/:sector?account=<slug>`
- `/demo?sector=<sector>&account=<slug>`

### Prioridad de sector (centralizada en `src/lib/sectorResolver.js`)
1. `:sector` de ruta.
2. Query param `?sector=`.
3. Selección manual del usuario (persistida).
4. `default_sector` de `AppSettings`.
5. Sector por defecto de acceso del usuario autenticado.
6. Fallback `neutral`.

### Prioridad de cuenta demo (centralizada en `src/lib/demoAccountResolver.js`)
1. `?account=<slug>` explícito.
2. Cuenta seleccionada manualmente/persistida.
3. `default_demo_account_<sector>` o `default_demo_account_slug` en `AppSettings`.
4. Primera cuenta activa y pública del sector.
5. Primera cuenta activa del sector.
6. Fallback neutral.

> La app ya no depende de “la primera Winery pública activa” sin contexto sectorial.

## Configuración de cliente demo desde Admin

Se mantiene compatibilidad técnica con entidad `Winery`, pero la UI está orientada a **cuentas demo / clientes demo**.

En **Admin > Accounts** puedes gestionar:
- nombre visible, slug público, activa/inactiva, demo pública;
- sector, prioridad demo;
- claim, subtítulo, tono, descripción corta, propuesta de valor, CTA;
- FAQs, reglas IA de recomendación y objeciones;
- prompts sugeridos (texto/bullets);
- hero override;
- endpoint override y token override del agente;
- idiomas disponibles e idioma por defecto.

## Integración con enllac-agent

### Resolución de endpoint (`src/lib/agentEndpointResolver.js`)
1. Override por cuenta demo (`agent_endpoint_override`).
2. Endpoint global (`agent_endpoint_url`).
3. Normalización de trailing slash.
4. Preferencia por `/v1/chat`.
5. Fallback automático a `/chat`.

### Headers canónicos
- `Content-Type: application/json`
- `X-Request-Id: <uuid-like>`
- `X-Agent-Token: <token>` (si existe token compartido/override)
- `X-Demo-Request-Id` solo como compatibilidad temporal.

> No se usa `Authorization` como header principal para este caso.

### Errores y timeout (`src/lib/agentClient.js`)
- Timeout configurable por `agent_timeout_ms` (default 30000 ms).
- Clasificación explícita: `TIMEOUT`, `NETWORK` (incl. `Failed to fetch`/CORS), `BACKEND_4XX`, `BACKEND_5XX`, `NON_JSON`, `CONFIG`.
- Retry limpio en UI sin duplicar mensajes basura en chat.

## Payload al agente (`src/lib/agentPayload.js`)

El payload incluye:
- `businessContext`, `offers`, `leadContext`, `conversation`, `metadata`.
- Compatibilidad legacy: `winery`, `messages`.

Normalizaciones clave:
- `faqs`, `recommendation_rules`, `objection_rules`, `suggested_prompts` convertidos a arrays con `textToList`.
- `lead.name`, `lead.phone`, `lead.email` no viajan como strings vacíos (`null` si falta).
- `experiences` con shape estable y fallback por idioma.

## Parsing de texto a listas

`src/lib/textToList.js` soporta:
- arrays ya válidos,
- texto por líneas,
- bullets (`-`, `•`, numerados),
- limpieza de vacíos + trim,
- límite razonable.

## Tests y verificaciones

Se añadió base de tests ejecutable sin dependencias extra (`node:test`):
- resolución de sector,
- resolución de cuenta demo,
- parser texto→array,
- payload compatible (incl. email vacío),
- manejo de timeout,
- `Failed to fetch`,
- parseo de backend JSON 4xx,
- fallback `/v1/chat` -> `/chat`.

```bash
npm test
npm run build
```
