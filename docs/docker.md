# Self-host BJJ Journey with Docker Compose

Run the Compose stack on the same host as your existing `cloudflared` connector. The stack uses PostgreSQL 17 with a named volume, so container restarts preserve accounts and training history.

## Single-container NAS deployment

On a 64-bit Intel or AMD NAS, use `compose.single.yaml` to run the app and PostgreSQL in one container. PostgreSQL uses a private Unix socket inside the container. The named volume `bjj-data` stores the database. This setup needs `NEXTAUTH_URL` and `NEXTAUTH_SECRET` in `.env.docker`.

For private packages, first run `docker login ghcr.io -u YOUR_GITHUB_USERNAME` using a classic GitHub token with `read:packages`. Then pull and start the image:

```sh
docker compose --env-file .env.docker -f compose.single.yaml pull
docker compose --env-file .env.docker -f compose.single.yaml up -d --wait
```

The **Publish single-container NAS app to GHCR** workflow publishes `ghcr.io/cloudcookch/bjj-journey:2.0-single`. The app starts once database migrations and catalog seeding succeed. The host-level Cloudflare Tunnel still points at `http://127.0.0.1:3000`.

The single-container stack starts with a fresh volume. If you already have training data in the three-container stack, back up the old database and keep its volume until you have verified a migration. The multi-container instructions below remain available for those installations.

## Configure and start

1. Copy `.env.docker.example` to `.env.docker` and restrict access with `chmod 600 .env.docker`.
2. Set `NEXTAUTH_URL` to the exact public HTTPS origin you will use, for example `https://bjj.example.com`. Generate a separate value for each of `NEXTAUTH_SECRET` and `POSTGRES_PASSWORD` with `openssl rand -hex 32`. Keep these values in the ignored environment file and protect its backup.
3. From the repository root, start the stack:

   ```sh
   docker compose --env-file .env.docker up --build -d --wait
   docker compose --env-file .env.docker logs init
   ```

   The `init` service exits successfully after applying migrations and seeding the curated catalog. If it fails, inspect its log before retrying. The app listens on host loopback at port 3000 by default. Set `APP_PORT` before starting if that port is occupied. PostgreSQL is reachable by other Compose services over the private network.

## Pull the prebuilt NAS images from GHCR

On a 64-bit Intel or AMD NAS, save `compose.ghcr.yaml` as `compose.yaml` in a folder with your configured `.env.docker`. Keep the same Compose project and folder if upgrading an existing installation so the data volume retains its name.

If the packages are private, run `docker login ghcr.io -u YOUR_GITHUB_USERNAME` and enter a GitHub personal access token (classic) with `read:packages` at the password prompt. The account must have access to both packages.

```sh
docker compose --env-file .env.docker pull
docker compose --env-file .env.docker up -d --wait
```

The `2.0-nas` tag is the earlier multi-container image. For current single-container builds use `compose.single.yaml`.

## Route access through Cloudflare

1. In Cloudflare Zero Trust, create a **Self-hosted** Access application covering the entire hostname. Add an **Allow** policy for the intended identities and remove any bypass policy that would grant broader access.
2. In your existing Cloudflare Tunnel, add a published application route for that hostname. Set the service to `http://127.0.0.1:3000`, or substitute your `APP_PORT`. This origin is for a connector running directly on the same host.
3. Open the HTTPS address in a browser, authenticate with an allowed identity and create or sign in to a BJJ Journey account. In a separate browser profile, verify that an unapproved identity cannot reach the app. Use the configured HTTPS address for normal sign-in so NextAuth uses the expected origin and secure cookies.

## Update and recover

Back up the database before updating. For an upgrade, stop the app, rebuild and run initialisation explicitly, then start the updated app once initialisation succeeds:

```sh
docker compose --env-file .env.docker build app init
docker compose --env-file .env.docker stop app
docker compose --env-file .env.docker run --rm init
docker compose --env-file .env.docker up -d --wait
```

Use `docker compose --env-file .env.docker down` to stop the stack while retaining data. The `down --volumes` option deletes the database volume.

To back up and rehearse a restore, store the dump in a protected local directory. The restore project uses a separate volume and starts only its database:

```sh
umask 077
docker compose --env-file .env.docker exec -T db pg_dump -U bjj_journey -d bjj_journey -Fc > /secure/backup/bjj.dump
docker compose --env-file .env.docker -p bjj-restore up -d --wait db
docker compose --env-file .env.docker -p bjj-restore exec -T db pg_restore \
  -U bjj_journey -d bjj_journey --exit-on-error --single-transaction < /secure/backup/bjj.dump
docker compose --env-file .env.docker -p bjj-restore run --build --rm init \
  node scripts/migrate-training.mjs --check
```

Use a fresh restore volume for each rehearsal. Review the [migration runbook](training-migrations.md) before restoring or upgrading a live database. Existing hosted installations can continue to use the default Neon HTTP driver and `DATABASE_URL`.
