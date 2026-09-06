# Local infra (Docker Compose)

Local/dev-only infrastructure for services this monorepo depends on (currently: Postgres, per `docs/STACK.md`'s canonical persistence choice). This is **not** the production topology — see `docs/PRODUCTION_TOPOLOGY.md` and `docs/STACK.md` for that (K3s/Kubernetes, Traefik, Vault, Terraform). What lives here exists so that migrating a service from this compose file to a Kubernetes manifest later is a straight port, not a redesign.

## Discipline

1. **One directory per service under `data/`, named exactly like the compose service.**
   `data/postgres/` backs the `postgres` service. When this becomes a Kubernetes `StatefulSet` + `PersistentVolumeClaim`, the PVC is named `postgres` too — no remapping table to maintain, no "wait, which volume was that" at migration time.

2. **`data/` is gitignored (except `.gitkeep` placeholders); `compose.yaml` and this README are not.**
   Config is versioned, state is not — the same split Kubernetes forces on you (manifests in git, data in a PV), just enforced here by convention instead of the platform.

3. **No secrets with built-in defaults.**
   `${POSTGRES_PASSWORD:?...}` in `compose.yaml` means Compose refuses to start rather than silently run with a weak default. Copy `.env.example` to `.env` (gitignored) and set real values locally. In Kubernetes this same variable becomes a `Secret` reference, never a plain value in the manifest.

4. **Healthchecks and resource limits are defined now, per service, even though plain `docker compose up` only partially enforces them.**
   They're the direct analog of Kubernetes' `livenessProbe`/`readinessProbe` and `resources.requests`/`resources.limits` — write them once here and the Kubernetes manifest is close to a transcription.

5. **One service, one image, one job.**
   No bundling multiple concerns into a single container. Each compose `services.<name>` block should be able to become its own Kubernetes `Deployment`/`StatefulSet` without splitting it first.

## Adding a new service (e.g. Milvus, per `docs/STACK.md`)

1. `mkdir -p data/<service>` and `touch data/<service>/.gitkeep`.
2. Add a `services.<service>:` block to `compose.yaml` (or a new `compose.<service>.yaml` if the stack grows large enough to warrant splitting — combine with `docker compose -f compose.yaml -f compose.<service>.yaml up`).
3. Bind-mount volumes to `./data/<service>`, matching the directory name to the service name.
4. Add required env vars to `.env.example` (documented, no real values) and require them with `${VAR:?...}` in `compose.yaml` if they're secrets.
5. Add a `healthcheck` and `deploy.resources.limits`.

## Usage

```sh
cp .env.example .env   # then fill in POSTGRES_PASSWORD
task up                # or: docker compose up -d
task psql               # open a psql shell
task logs -- postgres   # follow logs for one service
task down               # stop (keeps data/)
task reset              # stop AND wipe data/postgres (asks for confirmation)
```
