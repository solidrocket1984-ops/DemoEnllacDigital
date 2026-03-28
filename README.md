# DemoEnllacDigital

Aplicación demo/public + panel admin compatible con Base44 y preparada para conectar con `enllac-agent`.

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

## Rutas principales

- `/` inicio público
- `/sectores/:sector` landing sectorial
- `/demo` demo pública con selector de sector + cuenta demo
- `/demo/:sector` demo anclada a sector
- `?account=<slug>` selección de cliente demo por URL

Ejemplo:

- `/demo/professional_services?account=empresa-x`

## Resolución de sector y cuenta demo

### Prioridad de sector
1. `:sector` en ruta (`/demo/:sector`)
2. query param `?sector=`
3. selección manual (persistida en localStorage)
4. sector de acceso de cliente autenticado
5. `default_sector` en `AppSettings`
6. fallback `neutral`

### Prioridad de cuenta demo activa
1. `?account=<slug>` explícito
2. `default_demo_account_<sector>` o `default_demo_account_slug` en `AppSettings`
3. primera cuenta activa + pública del sector
4. primera cuenta activa del sector
5. fallback neutral

## Configuración del agente (`enllac-agent`)

En **Admin > Settings**:

- `agent_endpoint_url`: URL base o URL completa (`/v1/chat` o `/chat`)
- `agent_connection_mode`: `remote` o `mock`
- `agent_shared_token`: token compartido opcional

Resolución final:

1. endpoint override de cuenta demo (`agent_endpoint_override`)
2. endpoint global (`agent_endpoint_url`)
3. intento canónico en `/v1/chat`
4. fallback automático a `/chat`

Se envía `Authorization: Bearer ...` si existe token (override de cuenta o compartido global).

## Configuración de cuenta demo (Admin > Accounts)

La entidad sigue siendo `Winery` por compatibilidad, pero en UI se gestiona como cuenta demo/cliente demo.

Campos clave:

- `nombre`, `slug`, `activa`, `demo_publica`
- `sector`, `prioridad_demo`
- `claim`, `subtitulo`, `cta`
- `tono_marca`, `descripcion_corta`, `propuesta_valor`
- `faqs_texto`, `reglas_recomendacion`, `reglas_objeciones`
- `idiomas_disponibles`, `idioma_defecto`
- `prompts_sugeridos` (JSON array)
- `hero_override` (JSON opcional)
- `agent_endpoint_override`, `agent_token_override`

## Payload al backend

La capa `src/lib/agentPayload.js` construye un payload robusto y compatible:

- `sector`
- `businessContext` (normalización de Winery)
- `winery` (compatibilidad legado)
- `offers` + `experiences`
- `messages`
- `metadata` (`account_slug`, `sector`, `source`)

## Compatibilidad mantenida

- Auth Base44 actual (sin cambios de flujo)
- Entidades existentes: `Winery`, `Experience`, `CapturedLead`, `AppSettings`
- Rutas legacy con redirects existentes
- Backend `enllac-agent` con compatibilidad `/v1/chat` + `/chat`

