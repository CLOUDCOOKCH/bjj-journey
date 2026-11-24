# BJJ Journey 2.0 for a UGREEN NAS

This bundle supports Intel and AMD 64-bit NAS devices. On the NAS, `uname -m` should return `x86_64`. Docker Compose v2 is required.

1. Extract the bundle to a folder on the NAS, then open a shell in that folder.
2. Load the local images with `docker load -i bjj-journey-images.tar`. The archive includes the app, database initializer and PostgreSQL 17.
3. Copy `.env.docker.example` to `.env.docker`. Set `NEXTAUTH_URL` to your public HTTPS hostname. Use `openssl rand -hex 32` twice to generate separate values for `NEXTAUTH_SECRET` and `POSTGRES_PASSWORD`. Restrict the file with `chmod 600 .env.docker`.
4. Start the stack with `docker compose --env-file .env.docker up -d --wait`. The initializer applies migrations and seeds the catalog before the app starts.
5. Use Cloudflare Access to restrict the hostname to your allowed identities. In your existing host-level Cloudflare Tunnel, forward that hostname to `http://127.0.0.1:3000`, or substitute the port you set in `APP_PORT`. Open the public HTTPS URL and sign in.

PostgreSQL keeps training data in the Compose volume. Running `docker compose --env-file .env.docker down` stops the stack and retains the volume. The `--volumes` flag deletes it.

If initialization fails, inspect it with `docker compose --env-file .env.docker logs init`.
