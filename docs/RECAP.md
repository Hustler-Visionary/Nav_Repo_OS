# RECAP — TST Autonomous / REPO_OS

_Estado del repositorio al 2026-09-06, rama `claude/realiza-recap-5nzzl3`._

## 1. Qué es este repositorio

El repo contiene dos piezas relacionadas:

1. **`src/domain/`** — el núcleo "TST Autonomous": una librería TypeScript, determinista y sin side effects reales, que modela un sistema de ejecución autónoma multi-agente con gobernanza (constitucional, policy-as-code, cognición, knowledge graph, replay). Se construyó incrementalmente en 27+ "fases", documentadas en `README.md`.
2. **`web/`** — **REPO_OS**: la primera interfaz web real del proyecto (Next.js 14). Lee en vivo los archivos de `src/domain/**`, construye un grafo de dependencias real, y expone un chat sobre un bus de mensajería real (NATS JetStream) protegido por un firewall semántico de allowlist.

## 2. Núcleo de dominio (`src/domain`, 42 módulos)

Evolución por bloques (detalle fase a fase en `README.md`):

- **Fundacional (Fase 1-6):** tipos de dominio, store, canvas navegable, node editor, trace bus, comandos de agente con approval gating, simulación de ejecución runtime multi-agente determinista.
- **Producto y cognición (Fase 7-20):** capas de producto autónomo, memoria de factory, debate/reconciliación multi-agente, evolución de confianza con evidencia, self-correction gobernada, replay cognitivo determinista.
- **Gobernanza institucional (Fase 21-24):** knowledge graph soberano con lineage e integridad verificable, policy-as-code runtime (deny-by-default), constitutional runtime (jerarquía `Constitution > Governance > Policy > Cognitive Kernel > Runtime > Agents > UI`), meta-gobernanza para evolución constitucional con continuidad de civilización.
- **Consolidación de producto (Fase 25-26.5):** vertical slice determinista end-to-end (Goal → Kernel → Policy → Constitutional → Evidence → Proposal → Simulation → Approval → Apply mock → Ledger → Knowledge → Replay → Executive Summary), operator experience real (readiness board, health, alerts, playbooks), y definición del stack de producción canónico (Postgres+Drizzle, Milvus, Docker/K3s/Traefik/Cloudflare Tunnel/Tailscale/Kyverno/Vault/Terraform).
- **Integración externa (Fase 26.6-27):** MCP Fabric y Unified Runtime Kernel, ambos **disabled-by-default**, sandbox-first, sin ejecución real de tools externas todavía.

**Invariante que se repite en todas las fases:** nada se ejecuta de verdad sin approval + policy decision + validación constitucional; deny-by-default; rollback antes de mutación; sin bypass del firewall semántico.

## 3. Interfaz web REPO_OS — estado actual

### Documentado en README (Fase 27.1-27.2)
- Grafo central derivado en vivo de `src/domain/**` (no mock) vía `RealRepoReadOnlyProvider`.
- Panel de detalle por nodo: tabs Code (Monaco real), Runtime (riesgo/costo/estado), GNN (heurísticas de acoplamiento, explícitamente no un modelo entrenado).
- Layout tipo "grafo de memoria" (`d3-force`) en vez de grilla fija.
- Chat panel desacoplado sobre **bus real** (NATS JetStream, `nats-server` levantado por `web/instrumentation.ts`), con worker en background que invoca funciones reales de `src/domain`.
- **Semantic firewall real**: gramática regex ancladas a 4 intents fijos (`refrescar grafo`, `buscar <texto>`, `leer <path>`, `ejecutar <objetivo>`); cualquier otro texto se bloquea y se audita por el bus, sin interpretación abierta por LLM.

### Trabajo posterior no reflejado aún en README (12 commits, 2026-07-28/29)

`README.md` no se ha vuelto a tocar desde el commit `27f6895` (el que documenta la Fase 27.2). **Todos** los commits siguientes —12 en total— existen en el árbol pero no están narrados como fase formal:

| Commit | Cambio |
|---|---|
| `699d94c` | Requiere doble-click para abrir el panel de detalle del nodo (antes abría con un click) |
| `854c356` | Lazy-load del panel de detalle completo; resaltado por extensión de archivo (`web/lib/language.ts` nuevo) |
| `b06e95a` | Nodos del grafo renderizados como orbes circulares en vez de "pill chips" |
| `d4006e4` | Rediseño del chat como UI de mensajería real estilo Telegram/Messenger (`ChatPanel.tsx` reescrito, +193/-51 líneas) |
| `6c4ca82` | **Historial de chat persistido en el bus JetStream real**: nuevo subject `repo.chat.<sessionId>`, `logChatEntry`/`fetchChatHistory` en `web/lib/bus.ts`, endpoint `GET /api/chat/history` |
| `b4f85f1` | Paridad de UX con claude.ai: lista de conversaciones (`ConversationList.tsx`), render de Markdown (`MarkdownMessage.tsx`), streaming, gestión de sesiones (`web/lib/chat-sessions.ts`) |
| `01637d4` | Renombra label del sidebar de `ROOT` a "Explore Repository" |
| `8dffe0f` | Renombra `METADATA` a `UI`; el nav del sidebar pasa a ser un router real |
| `736c991` | Tab "Preview" con React real para nodos de capa UI (`web/components/ui-preview/panels.tsx`, 446 líneas + `ui-preview-samples.ts`) |
| `1dab500` | Path del repo objetivo configurable (`web/lib/repo-config.ts`, `.env.example`) — primer paso hacia soporte multi-proyecto. **Alcance parcial documentado en el propio código**: solo afecta el grafo/lectura de código genérico; el chat (`execute-intent.ts`) y el tab Preview (`ui-preview-samples.ts`) siguen importando funciones específicas de `src/domain` de *este* repo en build-time, y necesitarán rework dedicado para apuntar a un repo objetivo distinto |
| `70e09dc` | Dashboard "Full Interface" ensamblado, agregado al nav (`AssembledInterface.tsx`) |
| `e2deef5` | Restyle completo de la UI a estilo "glassmorphism premium" (`globals.css` + ~10 componentes) |

Nota de alineación: la persistencia de historial de chat (`6c4ca82`) usa el mismo stream JetStream con `StorageType.File` en `web/.nats-data` y retención de 24h (`max_age`) — coherente con lo que README ya documenta como "sin clustering ni persistencia fuera de `web/.nats-data`", pero es una capacidad concreta (historial de sesión sobrevive a un reload) que hoy no está mencionada en ningún doc.

Recomendación: consolidar esto como **Fase 27.3** en `README.md` para no perder trazabilidad del proyecto (ver sección 6).

## 4. Qué es real vs. qué es mock/simulado (distinción crítica)

**Real:**
- La UI web, lectura de archivos en vivo, derivación del grafo de dependencias.
- El bus de mensajería (NATS JetStream) y el worker que consume intents.
- El firewall semántico (validación regex real, sin LLM en el camino).
- Editor Monaco self-hosted (sin CDN externo).

**Mock/simulado (por diseño, en todas las fases del dominio):**
- Todo el runtime de ejecución autónoma multi-agente, approvals, apply, ledger, constitutional runtime, policy runtime, knowledge graph institucional: deterministas, replayables, sin mutaciones externas reales.
- Métricas "GNN" en la UI: heurísticas de acoplamiento de imports, no un modelo entrenado.
- Sin escritura de repo desde la UI (`readonly-real` únicamente).
- El bus NATS solo corre localmente, sin clustering ni persistencia fuera de `web/.nats-data`.

## 5. Stack técnico actual vs. canónico

- **Core (`src/`):** TypeScript estricto, Zustand, `node --test` para unit tests, sin dependencias de infraestructura real.
- **Web (`web/`):** Next.js 14 (App Router), React 18, Tailwind, `@xyflow/react`, Monaco, Framer Motion, `nats` (JetStream), `d3-force`.
- **Stack de producción canónico** (definido en Fase 26.5, `docs/STACK.md`, aún **no implementado**): PostgreSQL + Drizzle ORM (ledger append-only, tenant isolation), Milvus para vectores, Docker/K3s/Traefik/Cloudflare Tunnel/Tailscale/Kyverno, Vault + Terraform (plan/preview-first, apply bloqueado sin approval package).

## 6. Gaps hacia producción real

- Persistencia externa para ledger/replay/knowledge graph (hoy todo es in-memory/determinista).
- Integración de runtime/distributed fabric real detrás del operator shell.
- Clustering/persistencia del bus NATS más allá de una sola instancia local.
- Autenticación y despliegue de `web/` — hoy pensado solo para `localhost`.
- Ampliación gobernada del firewall semántico (hoy 4 verbos fijos).
- Minimapa y tabs NODES/TERMINAL/METRICS del mockup original de REPO_OS, fuera de esta primera versión.
- El historial de chat persiste en JetStream pero con retención fija de 24h y una sola instancia local (`web/.nats-data`) — no es persistencia "real" de nivel producción, solo sobrevive a un reload de página.
- El path de repo configurable (`1dab500`) solo cubre grafo/lectura de código; el chat y el tab Preview siguen atados al `src/domain` de este repo.
- Los 12 commits de la sección 3 no están documentados como fase en `README.md`.

## 7. Próximas recomendaciones (por impacto)

1. **Documentación**: añadir una entrada "Fase 27.3" en `README.md` cubriendo los 12 commits de la sección 3 (rediseño y persistencia de chat, UX del panel de detalle, router real del sidebar, tab Preview, path de repo configurable, dashboard ensamblado, restyle) — para no perder la trazabilidad fase-a-fase que el resto del proyecto mantiene rigurosamente.
2. **Cobertura de tests**: `web/lib/repo-config.ts` (nuevo comportamiento público: repo objetivo configurable) y el router real del sidebar no tienen tests visibles en `src/tests/` — priorizar antes de habilitar más de un proyecto objetivo.
3. **Seguridad antes de exponer `web/`**: agregar autenticación mínima y revisar CORS/CSRF antes de cualquier despliegue fuera de localhost, dado que hoy no hay capa de auth.
4. **Prueba de concepto de persistencia real**: iniciar Postgres+Drizzle detrás de un flag explícito para el ledger, sin tocar el resto del dominio mock, como primer paso medible hacia el stack canónico de Fase 26.5.
