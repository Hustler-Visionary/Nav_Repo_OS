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

### Documentado en README (Fase 27.1-27.3)
- Grafo central derivado en vivo de `src/domain/**` (no mock) vía `RealRepoReadOnlyProvider`.
- Panel de detalle por nodo: tabs Code (Monaco real), Runtime (riesgo/costo/estado), GNN (heurísticas de acoplamiento, explícitamente no un modelo entrenado). Requiere doble-click para abrir (un click solo selecciona); carga perezosa vía `next/dynamic`.
- Layout tipo "grafo de memoria" (`d3-force`) en vez de grilla fija; nodos como orbes circulares.
- Chat panel desacoplado sobre **bus real** (NATS JetStream, `nats-server` levantado por `web/instrumentation.ts`), con worker en background que invoca funciones reales de `src/domain`. Historial de sesión persistido en el propio stream (`repo.chat.<sessionId>`, retención 24h) y multi-conversación con paridad de UX con claude.ai (índice de sesiones en `localStorage`, contenido en el bus).
- **Semantic firewall real**: gramática regex ancladas a 4 intents fijos (`refrescar grafo`, `buscar <texto>`, `leer <path>`, `ejecutar <objetivo>`); cualquier otro texto se bloquea y se audita por el bus, sin interpretación abierta por LLM.
- Nav del sidebar con estado por-tab (no routing por URL) para `Explore Repository` (antes `ROOT`) y `UI` (antes `METADATA`); tab `UI` con modo `interface` (dashboard ensamblado con paneles de preview reales, `AssembledInterface.tsx`) y modo `graph` (grafo de dependencias por archivo, sin cambios de fondo).
- Path de repo objetivo configurable (`web/lib/repo-config.ts`) para el grafo/lectura de código — con el alcance parcial documentado abajo.
- Restyle "glassmorphism premium" en toda la UI.

**Nota de esta validación**: la Fase 27.3 fue redactada y agregada al README en esta misma sesión, a partir de los 12 commits (`699d94c`…`e2deef5`, 2026-07-28/29) que existían en el árbol sin narración formal desde que `27f6895` (Fase 27.2) fue el último commit en tocar `README.md`. Detalle completo, incluyendo la corrección de un intento previo de este recap que solo cubrió 6 de los 12 commits, en el historial de commits de esta rama.

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

## 7. Próximas recomendaciones (por impacto)

1. ~~Documentación: consolidar los 12 commits sin narrar como "Fase 27.3" en `README.md`.~~ **Hecho en esta sesión.**
2. **Cobertura de tests**: `web/lib/repo-config.ts` (nuevo comportamiento público: repo objetivo configurable) y el nav del sidebar (`RepoOsShell.tsx`) no tienen tests visibles en `src/tests/` — priorizar antes de habilitar más de un proyecto objetivo.
3. **Seguridad antes de exponer `web/`**: agregar autenticación mínima y revisar CORS/CSRF antes de cualquier despliegue fuera de localhost, dado que hoy no hay capa de auth.
4. **Prueba de concepto de persistencia real**: iniciar Postgres+Drizzle detrás de un flag explícito para el ledger, sin tocar el resto del dominio mock, como primer paso medible hacia el stack canónico de Fase 26.5.
