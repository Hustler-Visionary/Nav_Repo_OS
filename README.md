# TST Autonomous / repo-navigator-canvas

## Plan por fases

### Fase 1: Arquitectura base (prioridad absoluta)
1. Definir estructura de carpetas modular en `src/`.
2. Crear tipos de dominio estrictos (sin `any`) para nodos, trazas, validaciones, gobernanza y state machine.
3. Implementar store con Zustand por slices (`repo`, `graph`, `editor`, `agent`, `trace`, `governance`, `uiValidation`).
4. Implementar selectores puros.

### Fase 2: Navegación operacional del repo
1. Construir canvas navegable (pan/zoom, búsqueda, selección, filtros por capa).
2. Habilitar navegación por dependencias.
3. Mostrar nodos operacionales con metadata (risk/confidence/cost, estado, validaciones, trace-events).

### Fase 3: Node editor dual-tab
1. Tab `CÓDIGO (Editor principal)` con preview, lenguaje y numeración de líneas.
2. Tab `Descripción y Registro` con descripción, responsabilidades, dependencias, notas de arquitectura, trazas y changelog.
3. Header con path real, lenguaje y tipo de artefacto.

### Fase 4: Trace Spine + command pipeline
1. Implementar Trace Event Bus tipado y obligatorio para acciones.
2. Implementar pipeline de comandos de agente con `validate`, `preview`, `expectedTraceEvents`, `apply`, `rollbackPlan`, `requiredApprovalLevel`.
3. Garantizar transiciones de estado válidas por state machine.

### Fase 5: AI Interface Validation Loop
1. Implementar validación de UI previa a aprobación humana.
2. Emitir `ui_validation_failed` ante fallas y aplicar retry budget.
3. Escalar cuando se excede el presupuesto.

### Fase 6: Tests + documentación de extensión
1. Unit tests para selectores, comandos, transiciones y trace bus.
2. Documentar extensión: nuevos nodos, capas, acciones, trace-events e integración futura con API/repo real.

## Prioridad absoluta
Primero arquitectura, estado, tipos y navegación real del repo.
Segundo editor de nodo con Código / Descripción y Registro.
Tercero Trace Spine y validación.
Cuarto estética HUD.

No sacrificar gobernanza por visuales.
No sacrificar trazabilidad por velocidad.
No sacrificar producto por demo.

## Fase 4: Repo Real Adapter + Live Canvas Contract

### RepoProvider contract
Se implementa contrato tipado `RepoProvider` con:
- `listTree()`
- `readFile(path)`
- `getMetadata(path)`
- `getDependencies(path)`
- `getChangeHistory(path)`
- `createChangePreview(command)`
- `applyApprovedChange(approvalPackageId)`

### Providers
- `MockRepoProvider`: provider activo por defecto.
- `FileSystemRepoProvider` (stub seguro): deshabilitado por default, sin side effects.
- `GitRepoProvider` (stub seguro): sin conexión remota ni side effects.

### Repo mode por defecto
- `repoMode = mock`.
- Flujo real protegido: `command -> diff preview -> approval package -> semantic firewall -> validation gate -> applyApprovedChange -> trace-event`.

### Conectar repo real en futuro
1. Implementar `FileSystemRepoProvider` real con permisos explícitos por scope.
2. Mantener `readonly-real` por defecto para repos reales.
3. Habilitar `governed-write` solo con approvals y gates activos.
4. No usar tokens en runtime del canvas.

### Permisos requeridos
- Read scope: listado/lectura de archivos dentro de prefijos permitidos.
- Write scope: solo gobernado por approval package aprobado.
- Trace scope: toda operación de lectura/cambio debe emitir eventos.

### Extender providers
- Crear provider que implemente `RepoProvider`.
- Registrar `mode` explícito.
- Implementar previews antes de apply.
- Bloquear side effects cuando el provider esté en modo stub/read-only.

## Fase 5: Graph Orchestration Surface + Operational HUD

Canvas no es UI. Es superficie operacional gobernada.

### Graph orchestration model
- Engine en `src/domain/graph-orchestration/` con `ExecutionGraph`, `ExecutionNode`, `ExecutionEdge`, `ExecutionRoute`, `AgentTask`, `VerificationTask`, `ApprovalCheckpoint`.
- Estados soportados: `DRAFT`, `QUEUED`, `ROUTING`, `WAITING_APPROVAL`, `APPROVED`, `EXECUTING`, `VERIFYING`, `BLOCKED`, `FAILED`, `ESCALATED`, `COMPLETED`.

### Markov routing conceptual model
- `evaluateRoute()`, `selectBestRoute()`, `rejectUnsafeRoute()` en `src/domain/markov/`.
- Penaliza riesgo, retries y loop-risk; bloquea rutas fuera de scope aprobado.

### Governance overlays + HUD
- HUD operacional: top-bar con mode, governance, activos, bloqueos, escalaciones y throughput.
- Overlays por nodo: firewall blocked, approval required, validation failed, verification pending, escalation active, rollback ready.

### Trace streaming
- `src/domain/trace-stream/` con buffer acotado, filtros por categoría/severidad/correlationId, virtualized window y throughput.

### Loop visualization
- `LoopDiagnosticPanel` detecta firmas de loop por retries/failures y activa alerta inmediata.

### Evolution surface
- `EvolutionSurface` renderiza rule candidates y evolution proposals sin auto-apply.

### Snapshot foundation
- `src/domain/snapshots/` con `createSnapshot`, `restoreSnapshot`, `compareSnapshots`.
- Base para time-travel gobernado sin persistencia externa.

### Performance constraints
- Buffer de traces bounded.
- Virtualization window para stream.
- Diseño apto para selectors memoizados y updates throttled en integración UI real.

## Fase 6: Autonomous Execution Simulation + Multi-Agent Runtime Surface

### Runtime simulation model
- `src/domain/runtime-simulation/` modela `RuntimeExecutionSession`, `RuntimeAgent`, `RuntimeTask`, `RuntimeExecutionCycle`, `RuntimeExecutionQueue`, `RuntimeDecisionFrame`.
- Estados runtime: `IDLE`, `WAITING`, `THINKING`, `PLANNING`, `EXECUTING`, `VERIFYING`, `HANDOFF`, `BLOCKED`, `ESCALATED`, `COMPLETED`, `FAILED`.
- Simulación determinística, replayable y auditable sin side effects reales.

### Autonomous orchestration lifecycle
Human Goal → Cognitive Interpretation → Planning → Markov Route → L8 Coordination → Agent Assignment → Parallel Execution → Verification → Validation → Governance Check → Completion.

### Replay engine
- `src/domain/playback/`: `replayExecution`, `stepForward`, `stepBackward`, `jumpToTrace`, `replayFromSnapshot`.
- Soporta timeline/scrubbing en modo replay conceptual.

### Governance interruption model
- Pausas por governance y emergency-stop modelados en sesión runtime.
- Reglas: dependency unresolved=blocked, retry overflow=escalation, failed verification=reroute, approval required=pause queue.

### Cognitive operational layer
- `src/domain/cognition/` genera racionales operacionales: why route, why blocked, why escalated, why rerouted, why confidence changed.

### Deterministic demo system
- `src/demo-scenarios/` incluye 8 escenarios: success, validation recovery, firewall recovery, escalation, retry overflow, evolution generation, loop prevention, governance interruption.

### Runtime safety guarantees
- Mock-safe, governed, deterministic.
- No runtime real, no filesystem writes reales, no git mutation real, no MCP execution real.

### Execution memory model
- Métricas en `runtime-simulation/metrics.ts`.
- Base para bounded replay memory, event batching, frame-safe updates y lazy trace hydration en UI real.

## Fase 7: Autonomous Product Factory Layer

### Product workflow lifecycle
- `src/domain/product-workflows/` define `ProductWorkflow`, fases, milestones, checkpoints y dependencias.
- Estados: `PLANNED`, `SCOPED`, `APPROVED`, `IN_PROGRESS`, `VERIFYING`, `BLOCKED`, `ESCALATED`, `RECOVERING`, `COMPLETED`, `FAILED`.

### Autonomous delivery lifecycle
- 7 fases: interpretación/planificación, arquitectura/dependencias, implementación, verificación/QA, governance review, evolución, completion/snapshot.
- Cada fase es traceable y deterministic en simulación.

### Recovery model
- `recovery.ts` implementa diagnóstico → recovery plan → governance review flag → reroute/retry simulation → candidate de evolución.

### Governance escalation model
- Workflow bloqueado crea presión operacional y recovery paths gobernados.
- Sin side effects reales fuera del entorno mock-safe.

### Deliverable generation
- `src/domain/deliverables/` genera: architecture briefs, implementation/governance reports, execution summaries, trace/risk/verification reports, evolution proposals, rollback plans, approval packages.
- Entregables versionados, deterministic y replayables.

### Executive operations layer
- `ExecutiveOperationsPanel` muestra workflows activos, bloqueos y delivery confidence.

### Factory memory model
- `src/domain/factory-memory/` indexa memoria de workflows/fallas/recoveries/governance/evolución y replay pointers.

### Operational intelligence surface
- Base para visualizar propagación de workflows, dependencias cross-subteam, checkpoints de governance, recovery paths y bottlenecks.
- Garantía: autonomía gobernada observable, no caos autónomo.

## Fase 8: Zero-Touch Autonomous Delivery Demonstration Layer

### Cinematic execution model
- `src/domain/cinematics/` define timelines determinísticas con waves, pulses, scans, shockwaves y transiciones.
- Soporta compresión/expansión temporal y animation throttling para frame-safe updates.

### Replay theater architecture
- `ReplayTheater` renderiza replay cinematográfico con scrubbing conceptual, focus, speed y heatmap (densidad, escalación, recovery).

### Storytelling layer
- `src/domain/storytelling/` genera narrativa operacional (execution/governance/recovery/escalation/replay/reasoning/milestone).
- Responde WHY reroute, WHY blocked, WHY recovery, WHY confidence.

### Executive demo mode
- `ExecutiveDemoMode` calcula KPIs autónomos de demostración y renderiza un resumen ejecutivo fullscreen-friendly.

### Operational heatmaps
- Heatmaps operacionales en replay: escalation zones, recovery zones y execution density.

### Deterministic orchestration cinematics
- `src/domain/demo-director/` orquesta escenas determinísticas, pacing y camera focus system (execution/escalation/recovery/governance/reasoning).

### Governance cinematic system
- Overlays/pulses de governance integrables al teatro: activation/clearing, escalation waves, recovery arcs.
- Invariante: demo-safe, governed, replayable, auditable, sin side effects externos.

## Fase 9: Investor / Enterprise / Civilization Demonstration Layer

### Civilization orchestration model
- `src/domain/civilization/` modela `OrganizationGraph`, `AutonomousOrganization`, `AutonomousDivision`, `StrategicWorkflowCluster`, `EnterpriseExecutionGrid`, `GovernanceMesh`, `EvolutionMesh`.
- Diseñado para visualizar coordinación organizacional multi-workflow a escala enterprise/civilization.

### Enterprise governance mesh
- Governance mesh activable, enrutable y medible (saturation/interventions).
- Soporta simulación de escalaciones cross-division y recuperación estratégica.

### Strategic replay system
- Escenarios civilization replay determinísticos en `src/demo-scenarios/civilization/`.
- Reproduce propagación organizacional, crisis governance, storms y recovery waves.

### Organizational intelligence layer
- `StrategicOperationsCenter` + KPIs estratégicos + heatmaps enterprise.
- Métricas: resilience, recovery velocity, governance effectiveness, synchronization fidelity, intelligence score, evolution momentum, mitigation efficiency, replay explainability.

### Investor demonstration mode
- `InvestorDemoMode` presenta command-center enterprise con narrativa de coordinación autónoma gobernada y resiliencia organizacional.

### Civilization-scale orchestration guarantees
- Deterministic.
- Replayable.
- Governed.
- Cinematic.
- Auditable.
- Demo-safe.
- Sin runtime real, cloud real, deploy real, ni side effects externos.

### Anti-degradation strategic model
- Evolución sigue gobernada, sin auto-mutación en producción.
- Recovery estabiliza y governance sincroniza para evitar degradación sistémica.

## Fase 10: Reality Bridge Layer

### Reality bridge philosophy
- `src/domain/reality-bridge/` implementa un puente de ejecución real-controlada: governed, bounded, reversible y auditable.
- Nada ejecuta libremente: todo requiere permit, scope, boundaries, traceability y rollback readiness.

### Bounded autonomy model
- Scope explícito para paths/comandos/dominios/capabilities MCP.
- Protected roots inmutables.
- Blast radius score con thresholds.
- Governance lock + emergency stop.

### Rollback guarantees
- Snapshots de rollback (`createRollbackSnapshot`).
- Planes con confidence (`applyRollback`).
- Priorización de rollback sobre velocidad.

### Approval enforcement
- Sin `humanApprovalState=approved`, no write aplicado.
- Sin scope válido, operación bloqueada.
- Sin governance, no hay ejecución real-controlada.

### Blast radius governance
- `blastRadiusScore()` + `blastRadiusExceeded()` para limitar impacto.
- Soporta escalación preventiva y bloqueos.

### Sandbox model
- Sesiones con boundary (`timeoutMs`, `maxMemoryMb`, `dryRun`, `sandboxRoot`).
- Modelo deterministic-safe y replayable.

### Deterministic execution constraints
- Preview-before-write por `RealityExecutionDiff`.
- Receipts por acción (`RealityExecutionReceipt`) con replay metadata.
- Replay consistency sin side effects externos.

### Anti-catastrophic architecture
- Governance lock propagation.
- Emergency stop.
- Bounded filesystem/network/command/MCP surface.
- Human-loop mantiene autoridad final.

## Fase 11: Real Repository Read-Only Integration + Evidence Layer

### Real repo read-only model
- `RealRepoReadOnlyProvider` (`src/domain/repo/providers/RealRepoReadOnlyProvider.ts`) habilita ingestión de repos reales en modo estrictamente read-only.
- Operaciones soportadas: `listTree`, `readFile`, `getMetadata`, `getDependencies`, `getChangeHistory` (modo seguro), `createEvidenceBundle`.
- Operaciones bloqueadas: write/delete/rename/chmod, mutaciones git, ejecución destructiva.

### Evidence-backed canvas
- `src/domain/evidence/` agrega bundles, hashes, receipts y confianza (`trust/staleness/sourceConfidence/integrityStatus`).
- Regla: sin evidence hash verificado, nodo no confiable.

### Trust scoring
- Factores: hash verificado, metadata, dependencias resueltas, changelog, edad del archivo, confianza del provider.

### Dependency discovery limits
- Descubrimiento estático read-only para TS/TSX/JS, Python, package.json y patrones de import/local references.
- Sin ejecución runtime.

### Allowed scopes + safety blocks
- Scope por root permitido.
- Bloqueos por path fuera de scope, archivo grande, extensión no permitida, symlink, root protegido.

### Why no writes in this phase
- Prioridad absoluta en evidencia verificable + receipts + replay.
- Primera etapa del Reality Bridge real: observación gobernada antes de cualquier mutación.

### Invariante
Primero evidencia.
Después inferencia.
Después propuesta.
Nunca mutación sin gobernanza.

## Fase 12: Governed Change Proposal System

### Proposal-first philosophy
- Ninguna mutación real inicia con apply directo.
- Todo cambio empieza como propuesta gobernada, evidence-backed, simulada y validada.

### Evidence-linked diffs
- `src/domain/change-proposals/` modela `ChangeProposal`, `ProposedDiff`, `ProposedFileChange`, `ProposedDependencyChange`, `ProposedRefactor`, riesgos, rollback y confidence.
- Cada diff contiene before/after, rationale, evidence refs, dependencias afectadas, risk score, confidence y rollback notes.

### Simulation-before-apply
- Motor incluye `simulateProposalApply`, `simulateDependencyImpact`, `simulateRollback`, `simulateFailureModes`.
- Sin escrituras reales en esta fase.

### Governance proposal lifecycle
- Estados soportados: `DRAFT -> EVIDENCE_LINKED -> VALIDATED -> SIMULATED -> GOVERNANCE_REVIEW -> APPROVAL_REQUIRED -> APPROVED -> APPLY_READY` (y rutas de rechazo/rollback).
- Cada transición requiere validación y trazabilidad.

### Blast radius analysis
- `estimateBlastRadius()` y score unsafe para bloquear propuestas de riesgo alto.

### Rollback guarantees
- `estimateRollbackComplexity()` + validación de rollback para asegurar reversibilidad antes de cualquier apply controlado futuro.

### Proposal replay model
- `replayProposal`, `replayProposalSimulation`, `compareProposalVersions`, `explainProposalEvolution`.
- Soporta explainability y auditoría de evolución de propuestas.

### Enterprise change governance
- Detección de duplicados y conflictos.
- Agrupación multi-file/refactor chain con `groupProposals` e impacto de grafo.

## Fase 13: Controlled Apply System

### Controlled apply philosophy
- Ninguna mutación ocurre fuera de gobernanza.
- Apply solo desde propuestas aprobadas, con validación final, receipts, replay y rollback-first.

### Rollback-first execution
- Toda ejecución crea checkpoints y soporta rollback determinístico.
- Rollback tiene prioridad sobre velocidad.

### Bounded mutation model
- Paths permitidos + protected roots.
- Límite de batch y ordenamiento controlado.
- Locks y emergency controls.

### Atomic apply guarantees
- Batches transaccionales con manejo de fallo parcial y rollback-on-failure.

### Governance lock model
- Locks por path, freeze de ejecución y detección de concurrent mutation.

### Integrity verification
- Validación de hash previo, scope, aprobación y consistencia post-apply.

### Emergency controls
- `emergencyStopApply`, `pauseApplyExecution`, `resumeApplyExecution`, `abortApplyExecution`.

### Replay guarantees
- Replay de apply/rollback y comparación de ejecuciones para auditoría.

## Fase 14: Operational Scale & Reliability Hardening

### Operational scalability model
- `src/domain/operational-hardening/` introduce budgets y políticas para evitar colapso por complejidad.
- El sistema puede degradar visuales bajo presión, pero nunca governance/rollback/trace integrity/approval enforcement.

### Retention policies
- `TraceRetentionPolicy` separa hot traces y archived traces.
- Archiving/compaction conserva integridad y reduce presión de memoria.

### Replay limits
- `ReplayWindowPolicy` limita frames activos (`enforceReplayWindow`) para replay bounded.

### Graph partitioning
- `partitionGraph()` divide render en particiones para workflows grandes y virtualización operacional.

### Memory budgets
- `MemoryBudget` + `enforceMemoryBudget()` vigilan traces/replay/graph pressure.

### Degradation policy
- `OperationalHealthWatchdog` activa high-pressure mode en sobrecarga.
- Degrada visuales/event volume, nunca governance guarantees.

## Fase 15: Production Readiness & Deployment Governance

### Deployment governance model
- `src/domain/deployment-governance/` define contratos para promoción controlada entre `local`, `preview`, `staging`, `production`.
- Production nunca recibe cambios sin release gates y verificación de readiness.

### Environment boundaries
- `EnvironmentBoundary` define scopes permitidos/bloqueados por entorno.
- Cualquier scope fuera de boundary bloquea promotion.

### Release gates
- `ReleaseGate` + `PromotionPolicy` exigen pruebas, gates, integridad de config y requisitos de rollback/observabilidad.

### Production readiness
- `DeploymentReadinessReport` consolida estado de pruebas, rollback, emergency stop, gates, config integrity, secrets policy y observabilidad.

### Secrets policy
- `SecretsPolicy` + redaction aseguran que secretos no aparezcan en trace.

### Observability requirements
- Production requiere `ObservabilityContract` válido (logs, metrics, traces).

### Rollback requirements
- `staging` y `production` requieren rollback plan antes de promotion.

### Invariante
Production no es un destino.
Production es un estado gobernado.

## Fase 16: SaaS Control Plane + Tenant Governance

Modelo multi-tenant enterprise gobernado:

- **Aislamiento estricto por tenant/org/project** con `TenantBoundary` y verificación explícita antes de cualquier operación de repo.
- **RBAC + ABAC** con `RoleBinding`, `AccessPolicy` y `AttributePolicy` para evaluar permisos por rol y atributos de contexto.
- **Gobernanza de cuotas y uso** con `UsageMeter` y `QuotaPolicy`: las cuotas bloquean ejecución antes de degradar el sistema.
- **Billing desacoplado de autorización**: `BillingAccount` registra consumo, pero no habilita ejecuciones.
- **Tenant audit inmutable** con `TenantAuditLog` append-only y evidencia de acciones.
- **Data residency** con `DataResidencyPolicy` para restringir operación por región permitida.

### Garantías

- Ningún trace debe cruzar límites de tenant.
- Ningún evidence bundle cruza límites de organización.
- Cambios de policy requieren rol `owner` o `admin`.
- Cualquier operación de repo requiere `project scope` válido.

### Eventos de traza incorporados

`tenant_created`, `tenant_boundary_verified`, `tenant_boundary_violation`, `access_policy_evaluated`, `access_policy_denied`, `quota_checked`, `quota_exceeded`, `usage_meter_recorded`, `billing_usage_recorded`, `project_scope_verified`, `data_residency_verified`, `tenant_audit_recorded`.

## Fase 17: Enterprise Security, Compliance & Trust Layer

### Enterprise security model
- Se agregó `src/domain/security-compliance/` con modelos y validaciones para postura de seguridad, cumplimiento y confianza auditable por tenant.

### Compliance controls
- Frameworks simulados soportados: `SOC2`, `ISO27001`, `GDPR`, `HIPAA_READY`, `ENTERPRISE_CUSTOM`.
- `ComplianceControl` permite evaluación determinística de controles requeridos.

### Data classification
- `DataClassificationPolicy` incorpora patrones de PII y secretos.
- `canExportPayload()` bloquea export/trace si detecta filtración de PII o secretos.

### Retention / legal hold
- `RetentionPolicy` se aplica por tenant y ventanas válidas.
- `LegalHoldPolicy` prevalece sobre deletion (`canDeleteWithLegalHold`).

### Security incident workflow
- `openIncidentResponse()` abre incidente y marca escalación para severidad alta/crítica.
- `resolveIncidentResponse()` cierra incidente en estado gobernado.

### Trust center model
- `createTrustCenterRecord()` forza redacción de campos sensibles para no exponer secretos.

### Export safety
- Invariante: PII/secret leakage bloquea exportación y trazas.
- Excepciones de seguridad requieren aprobación owner/admin mediante `evaluateSecurityExceptionApproval()`.

## Fase 18: Distributed Execution Fabric + Infrastructure Orchestration

### Distributed execution model
- Nuevo dominio `src/domain/distributed-fabric/` para orquestación distribuida gobernada entre clusters, workers, colas y regiones.

### Execution fabric architecture
- Entidades principales: `ExecutionFabric`, `ExecutionCluster`, `ExecutionWorker`, `DistributedQueue`, `QueuePartition`, `QueueLease`, `ExecutionLease`.
- Scheduling determinístico por capacidad (`assignTaskDeterministically`) y aislamiento de particiones.

### Worker lifecycle
- Heartbeat requerido por worker; timeout implica cuarentena (`checkWorkerHeartbeatTimeout`).
- Worker sin heartbeat no participa en ejecución segura.

### Lease / heartbeat model
- Ejecución basada en lease con expiración y requeue (`expireLeaseAndRequeue`).
- Heartbeat/lease protegen consistencia y evitan ejecución fantasma.

### Queue partitioning
- `QueuePartition` permite aislamiento en corrupción (`isolateQueuePartition`) y evita contagio entre particiones.

### Replay guarantees
- Replay distribuido determinístico (`deterministicDistributedReplay`) y correlación causal (`correlateDistributedTrace`).

### Infrastructure rollback
- `InfrastructureRollback` verificado explícitamente (`verifyInfrastructureRollback`).
- Recuperación de fabric acotada por pasos (`recoverFabricBounded`).

### Regional governance
- Cross-region requiere política explícita (`verifyRegionExecution`).
- Runtime sandbox obligatorio (`createRuntimeSandbox`).

### Bounded failover model
- Failover acotado por presupuesto de movimientos (`boundedFailover`) para evitar recovery no acotado.
- Invariante: fallas de workers no rompen governance spine (`governanceSpineSurvivesWorkerFailure`).

## Fase 19: Persistent State, Event Sourcing & Durable Audit Ledger

### Event sourcing model
- Se agregó `src/domain/event-sourcing/` con `EventStore`, `EventEnvelope`, `EventStream`, `EventCursor`, `EventProjection`, `StateProjection`, `SnapshotStore`, `TenantScopedStream` y `RetentionCursor`.
- Regla operacional: evento sin envelope o sin tenant scope se rechaza.

### Durable audit ledger
- Ledger append-only (`AuditLedger`, `LedgerEntry`) con hash chain obligatoria (`prevHash` + `hash`).
- Todo append exitoso actualiza ledger; snapshot nunca reemplaza ledger.

### Hash chain integrity
- `verifyLedgerHashChain()` detecta tampering y valida continuidad criptográfica de entradas.

### Projections
- `replayDeterministic()` reconstruye estado por causal order y bloquea violaciones.
- Violaciones de causalidad detienen proyección (no estado ambiguo).

### Tenant-scoped streams
- Streams aislados por `tenantId + streamId`; no mezcla cross-tenant (`tenant_stream_isolated`).

### Idempotency model
- Mutaciones requieren `idempotencyKey`; colisiones se rechazan (`idempotency_collision_detected`).

### Replay / reconstruction
- Estado reconstruible determinísticamente desde eventos durables.
- Snapshot sólo acelera lectura; no es fuente de verdad.

### Retention / legal hold interaction
- `RetentionCursor` recorta eventos elegibles.
- Legal hold bloquea borrado/retención destructiva, preservando evidencia.

### Invariante
- Lo que no está en ledger, operacionalmente no ocurrió.

## Fase 20: Autonomous Intelligence Kernel + Cognitive Governance

### Cognitive kernel architecture
- Se agregó `src/domain/cognitive-kernel/` con `CognitiveKernel`, memoria cognitiva y primitives para planificación, decisión, debate y autocorrección gobernada.
- El kernel mantiene `semanticFirewallActive` como boundary no negociable.

### Strategic planning model
- `StrategicObjective`, `GoalHierarchy`, `GoalConstraint` y `PlanningFrame` estructuran planificación estratégica en pasos y supuestos.
- Repriorización requiere aprobación de governance.

### Debate / reconciliation system
- `AgentDebateSession`, `DebateArgument`, `DebateResolution` permiten debate multi-agente trazable.
- Regla enforced: debate nunca aprueba ejecución (`approvedForExecution: false`).
- `reconcileConflict()` resuelve conflicto entre objetivos con rationale explícito.

### Confidence evolution
- `evolveConfidence()` impide incremento de confianza sin evidencia.
- Regresiones de confianza pueden detectarse para auditoría cognitiva.

### Governed self-correction
- `applySelfCorrection()` requiere checkpoint previo.
- `CognitiveRollback` obligatorio como garantía de reversibilidad cognitiva.

### Cognitive replay
- `replayReasoningDeterministic()` reconstruye reasoning de manera determinística y explicable.

### Intelligence boundaries
- Goal mutation sin governance se bloquea.
- El kernel nunca bypass semantic firewall.

### Explainability guarantees
- Decisión sin `DecisionRationale` válido es inválida.
- Cada decisión exige rationale resumido y evidencia asociada.

### Invariante
- Inteligencia sin gobernanza se convierte en deriva sistémica.

## Fase 21: Sovereign Knowledge Graph + Institutional Intelligence Network

### Sovereign knowledge graph architecture
- Se agregó `src/domain/knowledge-graph/` con `KnowledgeGraph`, `KnowledgeNode`, `KnowledgeEdge`, `SemanticRelationship`, `KnowledgeLineage`, `KnowledgeConfidence` y `KnowledgeIntegrityProof`.
- Tipos de nodo institucional cubren decisiones, eventos, políticas, contratos, workflows, debates, evidencia, riesgos, mitigaciones, auditoría y governance.

### Institutional intelligence model
- `InstitutionalMemory`, `InstitutionalPattern`, `KnowledgePromotion` y `KnowledgeGovernanceRule` soportan promoción gobernada de conocimiento institucional.

### Semantic lineage
- `reconstructLineageDeterministic()` reconstruye lineage de forma determinística.
- Conocimiento sin lineage confiable queda marcado como no confiable.

### Graph reasoning
- `traverseSemantic()` permite reasoning semántico trazable entre nodos.
- Edges requieren causalidad y contexto; si no, son inválidos.

### Institutional memory
- Memoria institucional mantiene promoción por tenant y respeta `legalHoldActive`.
- La memoria no bypass retention/legal hold.

### Governance-aware evolution
- `promoteInstitutionalMemory()` exige aprobación cuando la regla de governance lo requiere.
- Mutación semántica sin governance explícita debe bloquearse.

### Integrity proofs
- `verifyIntegrityProof()` y `containGraphCorruption()` detectan tampering y activan contención.

### Replayable institutional cognition
- `replayKnowledgePreservingLineage()` preserva lineage en replay.
- `KnowledgeSnapshot` y `SemanticIndex` permiten proyección/auditoría del estado institucional.

### Invariante
- Una organización autónoma sin memoria institucional verificable repite fallos sistémicos indefinidamente.

## Fase 22: Policy-as-Code Governance Runtime

### Policy-as-code runtime
- Se agregó `src/domain/policy-runtime/` con `PolicyDocument`, `PolicyRule`, `PolicyCondition`, `PolicyEffect`, `PolicyDecision`, `PolicyEvaluationContext`, `PolicyDecisionRecord`, `PolicyVersion`, `PolicyBundle`, `PolicyConflict`, `PolicySimulation`, `PolicyPromotionRequest`, `PolicyEnforcementHook`.
- La evaluación de policy es runtime y determinística para cada acción/contexto.

### Policy bundle model
- `loadPolicyBundle()` agrupa documentos versionados por dominio.
- Dominios cubiertos: repo, apply, deployment, tenant, security, compliance, cognition, knowledge, distributed-fabric, runtime, billing, storage.

### Deterministic evaluation
- `evaluatePolicy()` aplica matching determinístico por acción/dominio/condiciones.
- Invariante enforced: acción sin policy decision explícita queda bloqueada (deny-by-default).
- `deny` tiene precedencia total sobre `allow`.

### Conflict resolution
- `detectPolicyConflicts()` detecta reglas contradictorias por acción/dominio y exige governance review.

### Enforcement hooks
- `invokePolicyHook()` y `enforceWithHook()` conectan enforcement runtime.
- Si el hook falla, la decisión final es `deny` (deny-by-default operativo).

### Policy promotion lifecycle
- `simulatePolicy()` habilita simulación previa a promoción.
- `canPromotePolicy()` exige tests + approval + documento aprobado.

### Decision records
- `recordDecision()` produce `PolicyDecisionRecord` auditable para persistir en ledger.

### Invariante
- Gobernanza que no se ejecuta es documentación decorativa.

## Fase 23: Constitutional Runtime + Sovereign Operational Law

### Sovereign constitutional runtime
- Se agregó `src/domain/constitutional-runtime/` con `ConstitutionalCharter`, `ConstitutionalInvariant`, `SovereignBoundary`, `ConstitutionalDecision`, `ConstitutionalViolation`, `ConstitutionalOverrideRequest`, `ConstitutionalReview`, `ConstitutionalProof`, `ConstitutionalAudit`, `ConstitutionalFreeze`, `ConstitutionalEscalation`, `ConstitutionalSnapshot`, `ConstitutionalRecoveryPlan`, `ConstitutionalLineage`, `ConstitutionalAuthority`.
- La constitución ejecuta enforcement runtime, no solo documentación.

### Operational law hierarchy
- Precedencia implementada: `Constitution > Governance > Policy Runtime > Cognitive Kernel > Runtime > Agents > UI`.
- Capas inferiores pueden ser bloqueadas constitucionalmente.

### Constitutional invariants
- Se soportan invariantes soberanas clave: gobernanza humana, firewall semántico no bypass, rollback antes de mutación, deny-by-default, no cross-tenant leakage, no policyless execution, entre otras.

### Freeze architecture
- Freeze modes soportados: runtime, tenant, deployment, evolution, cognition y global emergency.
- Violación constitucional puede activar freeze y escalation inmediata.

### Sovereign recovery model
- Recovery incluye rollback a snapshot constitucional, replay de cadena de violaciones y verificación de integridad de lineage.

### Constitutional precedence chain
- `enforceConstitutionalPrecedence()` garantiza que constitución domine policy/runtime/agents.

### Anti-catastrophic governance
- Override sin autoridad soberana se rechaza.
- Bypass de semantic firewall queda invalidado constitucionalmente.
- Deny-by-default permanece como red de seguridad constitucional.

### Invariante
- Nada en TST Autonomous puede operar por encima de la constitución soberana.

## Fase 24: Self-Evolving Constitutional Civilization Kernel

### Meta-governance architecture
- Se agregó `src/domain/meta-governance/` con `MetaGovernanceKernel`, `ConstitutionalEvolutionProposal`, `ConstitutionalAmendment`, `SovereignIdentity`, `CivilizationState`, `CivilizationContinuity`, `GovernanceEpoch`, `SystemIdentityProof`, `EvolutionSimulation`, `EvolutionRiskEnvelope`, `MetaGovernanceDecision`, `SovereignConsensus`, `ConstitutionalDrift`, `StructuralMutation`, `IdentityIntegrityReport`, `CivilizationRecoveryFrame`, `EvolutionLineage`, `GovernanceContinuitySnapshot`.

### Sovereign constitutional evolution
- Evolución constitucional requiere simulación previa, consenso soberano y rollback readiness antes de amendment.
- La constitución no se auto-muta directamente: toda mutación estructural pasa por revisión y riesgo.

### Civilization continuity model
- Se valida continuidad de civilización (sin fragmentación, orphaning, replay discontinuity o memory collapse).
- Detección de fragmentación activa freeze meta-gobernado.

### Governance epochs
- `createGovernanceEpoch()` y snapshots de continuidad versionan etapas de gobernanza soberana.

### Sovereign identity preservation
- `verifySovereignIdentityIntegrity()` asegura continuidad de identidad constitucional, trust, replay, memoria institucional y soberanía tenant.

### Drift detection architecture
- Detección de drift para gobernanza, policy, cognition, evolution, replay inconsistency, authority/trust/sovereignty degradation.

### Evolution lineage replay
- `replayEvolutionLineage()` permite replay determinístico de lineage evolutivo.

### Anti-fragmentation safeguards
- `detectCivilizationFragmentation()` + `freezeMetaGovernance()` bloquean evolución insegura bajo fragmentación.

### Civilization recovery guarantees
- `recoverCivilizationState()` define recuperación determinística.
- Evaluación de riesgo (`evaluateEvolutionRisk`) bloquea mutaciones inseguras.

### Invariante
- TST Autonomous puede evolucionar sin perder identidad soberana, continuidad constitucional ni integridad civilization-scale.

## Fase 25: Product Consolidation, Vertical Slice & Public Demo Readiness

### Qué existe realmente
- Existe un vertical slice determinístico en `src/domain/product-consolidation/` que conecta: Human Goal → Cognitive Kernel → Policy Runtime → Constitutional Runtime → Evidence-backed Repo Read → Change Proposal → Simulation → Approval Package → Controlled Apply Mock → Ledger Record → Knowledge Graph Update → Replay → Executive Summary.
- Existe `renderProductShell()` en `src/components/product/ProductShell.tsx` para exponer en UI principal los campos obligatorios del slice.

### Qué es mock/simulado
- Controlled Apply en esta fase es **mock**.
- Repo evidence y proposal diff en slice son **simulados** (sin mutaciones reales).
- Replay timeline se reconstruye desde estado de escenario, no desde infraestructura externa.

### Qué está production-ready
- Evaluación determinística de slice y pruebas automáticas de flujo completo.
- Invariantes de approval gating en el slice.

### Qué falta para real infra
- Persistencia externa para ledger/replay.
- Integración UI en tiempo real con providers reales gobernados.
- Orquestación distribuida real conectada al shell de producto.

### Demo script
1. Lanzar `runVerticalSliceDeterministic("<goal>")`.
2. Renderizar `renderProductShell(shell, scenario)`.
3. Verificar approval state, ledger entry, knowledge update, replay timeline y executive summary.

### Investor narrative
- Producto demuestra autonomía gobernada end-to-end en un caso completo y explicable.
- La narrativa ejecutiva muestra control constitucional, decisión de policy, evidencia y replay.

### Operator runbook
- Verificar que `approvalState === approved` antes de apply mock.
- Confirmar `ledgerEntryId` no vacío.
- Confirmar `replayTimeline` reconstruible.
- Revisar `executiveSummary` para estado final del flujo.

## Fase 26: Real Operator Experience + Production Convergence

### Operator experience architecture
- Se agregó `src/domain/operator-experience/` con modelos de operación humana real: `OperatorWorkspace`, `OperationalSession`, `WorkflowPreset`, `IncidentConsole`, `LiveGovernanceMonitor`, `ReplayNavigator`, `CognitiveDecisionView`, `TraceExplorer`, `ConstitutionalAlert`, `OperationalNotification`, `ProductionReadinessBoard`, `SystemHealthOverview`, `GuidedExecutionFlow`, `OperatorAction`, `OperatorPermissionProfile`, `OperationalPlaybook`, `EnvironmentStatus`, `RuntimeHealthIndicator`.

### Production convergence model
- `generateProductionReadiness()` identifica subsistemas mock-only, fronteras de simulación, gaps de infra, blockers productivos, bottlenecks de escalabilidad y trust gaps.

### Observability model
- Se exponen indicadores de salud operacional reales de runtime/memoria/cola/drift/escalación (`calculateSystemHealth`).
- Alertas operacionales incluyen riesgo constitucional, degradación de governance, presión de cola y señales de drift.

### Onboarding model
- `createGuidedExecutionFlow()` habilita guided execution + explainability mode.
- `loadOperationalPlaybook()` aporta guías de recuperación y operación.
- `createReplayNavigationModel()` facilita walkthroughs de replay.

### Progressive disclosure strategy
- `simplifyOperationalView()` reduce complejidad visible y oculta eventos raw fuera del nivel de detalle seguro para operador.
- `enforceProgressiveDisclosure()` aplica visibilidad por perfil/permisos.

### Operational abstractions
- Vistas soportadas: Executive, Operator, Governance, Incident, Replay, Engineering, Investor.
- El operador consume resúmenes cognitivos/policy/constitucionales, no internals completos.

### Production blockers
- Persistencia externa robusta aún pendiente.
- Integración de runtime/distributed fabric real aún pendiente.
- Endurecimiento de observabilidad multi-tenant y alert routing real pendiente.

### Path to real deployment
1. Conectar health/alerts a fuentes runtime reales.
2. Integrar playbooks con incident workflows persistentes.
3. Activar readiness gates con evidencias externas verificables.
4. Consolidar operator shell como entrada primaria de operación.

### Invariante
- La complejidad interna de TST Autonomous no puede convertirse en carga cognitiva para el operador humano.

## Fase 26.5: Canonical Production Stack Definition

### Stack oficial
- Persistence: PostgreSQL + Drizzle ORM, ledger append-only y tenant isolation estricta.
- Knowledge/Vector: Milvus principal, pgvector opcional para consultas simples.
- Infrastructure: Docker, K3s/Kubernetes, Traefik, Cloudflare Tunnel, Tailscale, Kyverno, Vault/Doppler.

### Entregables nuevos
- `docs/STACK.md`
- `docs/PRODUCTION_TOPOLOGY.md`
- `docs/INTEGRATION_BOUNDARIES.md`
- `docs/SECURITY_BOUNDARIES.md`
- `src/domain/stack-definition/`

### Reglas de convergencia
- Qdrant prohibido.
- Prisma prohibido.
- Kyverno requerido antes de production-ready.
- Tailscale requerido para private admin/runtime mesh.

### Fase 26.5 update: HashiCorp canonicalization
- HashiCorp Vault es el secrets manager principal para producción.
- Doppler queda permitido sólo como alternativa inicial/dev/staging.
- Terraform se define como IaC canónico con plan/preview-first.
- Terraform apply queda bloqueado sin approval package + policy decision + constitutional validation + rollback plan.
- Secrets reales deben resolverse por referencia (no valor plano) y jamás exponerse en traces/logs/exports.

## Fase 26.6 MCP Fabric
Se incorpora `src/domain/mcp-fabric/` con modelo de registro, permisos, scope, sandbox, replay y audit receipts; sin ejecución MCP real ni conexión a tools externas en esta fase.

## Fase 26.7 + 27
Se agrega Unified Runtime Kernel y External Integration con estrategia disabled-by-default, sandbox-first y governance-first para activación real progresiva sin mutaciones externas por defecto.

## Fase 27.1: REPO_OS Web Interface

### Qué existe realmente
- Primera interfaz web real del proyecto en `web/` (Next.js 14 App Router + React + TailwindCSS + `@xyflow/react` + Monaco + Framer Motion), estilo operacional oscuro ("REPO_OS").
- El grafo central se construye leyendo en vivo los archivos reales de `src/domain/**` (no mock): `web/lib/graph.ts` reutiliza `RealRepoReadOnlyProvider` para lectura segura de archivos y deriva nodos/edges a partir de imports relativos reales.
- Click en un nodo abre panel de detalle con tabs Code (Monaco, contenido real del archivo vía `/api/file`), Runtime (estado/riesgo/costo) y GNN (métricas heurísticas de acoplamiento — explícitamente etiquetadas como análisis estático, no un modelo entrenado).
- Monaco se sirve self-hosted desde `web/public/monaco` (generado por `npm run postinstall`) para no depender de CDN externo.

### Qué es mock/simulado
- Las métricas "GNN" (blast radius, risk, confidence) son heurísticas deterministas sobre acoplamiento de imports y tamaño de archivo, no inferencia de un modelo real.
- No hay escritura ni mutación de repo desde la UI: solo lectura (`readonly-real`).

### Qué falta
- Minimapa y tabs NODES/TERMINAL/METRICS del mockup original quedan fuera de esta primera versión.
- Sin autenticación ni despliegue; pensado para correr localmente (`npm install && npm run dev` dentro de `web/`).

## Fase 27.2: Memory Graph Layout + Chat Separado sobre Bus Real (NATS JetStream)

### Qué existe realmente
- El layout del grafo pasó de grilla fija a un layout orgánico tipo "grafo de memoria" (`web/lib/layout.ts`, `d3-force`: repulsión, atracción por edges reales y agrupamiento suave por capa) — mismos 85 nodos reales, ahora dispuestos como un knowledge graph navegable.
- Se agrega un panel de chat separado (`web/components/chat/ChatPanel.tsx`) a la derecha, desacoplado del resto de la UI: nunca llama funciones de dominio directamente.
- **Semantic firewall real** (`web/lib/semantic-firewall.ts`): gramática de allowlist anclada (regex `^...$`) que traduce texto libre a uno de 4 intents fijos (`refrescar grafo`, `buscar <texto>`, `leer <path>`, `ejecutar <objetivo>`) o lo rechaza. No hay LLM interpretando instrucciones en este camino — cualquier texto que no matchee exactamente una de las gramáticas permitidas se bloquea, incluidos intentos de prompt injection, sin ejecutar nada.
- **Bus de mensajería real** (`web/lib/bus.ts`, `web/instrumentation.ts`): al arrancar Next.js se descarga y levanta un `nats-server` real con JetStream (`web/scripts/setup-nats.mjs`, binario oficial v2.10.22), se crea el stream `REPO_OS_BUS` y un worker en background (proceso separado del request HTTP) consume `repo.intent.submit` como consumer durable.
- Los intents aprobados por el firewall se publican en JetStream; el worker los ejecuta invocando **funciones reales** de `src/domain` (`buildDomainGraph`, y `runVerticalSliceDeterministic` + `renderProductShell` de `product-consolidation` para `ejecutar <objetivo>`) y publica el resultado; el chat lo recibe por SSE (`/api/chat/stream`) y lo renderiza. Los bloqueos del firewall también se auditan por el bus (`repo.audit.blocked`) y se transmiten en vivo a todos los clientes conectados.

### Qué es mock/simulado
- El layout de memoria es puramente visual (fuerzas de d3-force), no representa proximidad semántica real más allá del agrupamiento por capa.
- `ejecutar <objetivo>` corre `runVerticalSliceDeterministic`, que ya era determinista/mock en su propio dominio (approval y apply son mock, como documenta la Fase 25).

### Qué falta
- El bus solo corre localmente (un `nats-server` por instancia de dev/build), sin clustering ni persistencia fuera de `web/.nats-data`.
- El firewall es un allowlist fijo de 4 verbos; ampliarlo requiere agregar reglas explícitas, nunca interpretación abierta de texto.

## Fase 27.4: Backend API — NestJS + GraphQL + JWT + RBAC + CASL + Zod + CORS

### Qué existe realmente
- Primer backend HTTP real del monorepo, en `apps/api/` (`@tst-autonomous/api`), como app independiente junto a `apps/web/` (build vía `tsc` plano, no Nest CLI, para mantenerse consistente con el resto del monorepo).
- **GraphQL code-first** (`@nestjs/graphql` + `@nestjs/apollo`), schema autogenerado en `apps/api/src/schema.gql`, expuesto en `/graphql`; `GET /health` como endpoint REST simple.
- **JWT real** (`@nestjs/jwt` + `passport-jwt`): mutations `register`/`login` emiten un access token firmado (`sub`, `email`, `roles`); `JwtStrategy.validate()` reconsulta el usuario en cada request (una cuenta borrada pierde acceso de inmediato, no solo en el próximo login). `GqlAuthGuard` adapta el guard estándar de Passport al contexto de GraphQL.
- **RBAC + CASL combinados, no paralelos**: `Role` (`ADMIN`/`USER`) decide qué rama de reglas aplica; `CaslAbilityFactory` expresa qué puede hacer cada rama sobre el recurso demo `Task`, incluyendo condiciones de propiedad (`ownerId === user.id`) que un `@Roles()` a secas no puede expresar. Chequeo de clase (`@CheckPolicies` a nivel de guard, ej. "puede crear Task") separado del chequeo de instancia (`assertCan()` en el servicio, ej. "puede editar *esta* Task"), porque el segundo necesita el registro ya cargado.
- **Zod en vez de class-validator** en todo el proyecto: `ZodValidationPipe` genérico aplicado por argumento (`@Args("input", new ZodValidationPipe(schema))`), incluyendo la validación de variables de entorno al boot (`env.schema.ts`, falla rápido si falta `JWT_SECRET` o mide menos de 32 caracteres — sin fallback inseguro).
- **CORS real**, configurado una sola vez en `main.ts` (`app.enableCors`) para que REST y GraphQL compartan la misma política; origen por allowlist (`CORS_ORIGIN`, csv) con default seguro: `http://localhost:3000` fuera de producción, ningún origen permitido si `NODE_ENV=production` y no se configuró explícitamente.
- Semilla de administrador **opt-in** vía `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD` (sin credencial por defecto hardcodeada); `formatError` de GraphQL oculta stacktraces e internals en producción.
- Validado end-to-end contra un servidor real corriendo: registro/login, aislamiento de tareas entre dos usuarios `USER` (`ForbiddenException`, código `FORBIDDEN`/403 real, no un 500 genérico), bypass de un `ADMIN` vía `Action.Manage, "all"`, rechazo sin autenticar, validación Zod de inputs inválidos, y headers CORS correctos para origen permitido vs. no permitido.

### Qué es mock/simulado
- `UsersRepository`/`TasksRepository` son in-memory (`InMemoryUsersRepository`, `TasksRepository`), detrás de una interfaz explícita pensada para swap a Postgres/Drizzle (stack canónico de Fase 26.5) sin tocar los servicios ni la lógica de autorización.
- `Task` es un recurso de demostración para probar JWT+RBAC+CASL+Zod+GraphQL juntos, no un dominio de negocio real; no está conectado a `services/repo-knowledge` ni al resto del dominio TST Autonomous.

### Qué falta
- Persistencia real (hoy se pierde todo al reiniciar el proceso).
- Refresh tokens / revocación de sesión (hoy solo hay access token con expiración corta).
- Conectar `apps/api` a los `services/*` reales (repo-knowledge, governance-compliance, etc.) para exponerlos vía GraphQL en vez de solo el recurso `Task` de demostración.
- Rate limiting y throttling de login/register.
- Tests automatizados (`node --test`) para guards, `CaslAbilityFactory` y resolvers — hoy la validación fue manual contra un servidor real, no cobertura persistida en el repo.
