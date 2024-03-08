# Example Microserver

Allows colocating multiple Deno servers on the same Docker container using wildcard DNS, URL path, HTTP headers, and more.

Optimized for both cloud-hosting and self-hosting.

## Getting started

### Hosting

#### Cloud-hosting

You can easily deploy it as a Dockerized web service to cloud-hosting providers such as [render.com](https://render.com).

Prices are ~$5 for the cheapest hosting. Do not use free tiers as they may have high downtimes.

Just fork this repository on your GitHub account and select it on your cloud hosting platform.

<img src="https://github.com/hazae41/network-ws-to-tcp-proxy/assets/4405263/57eb5e56-7475-4bbf-9ba0-548f1444d6ff" width="500" />

Then setup environment variables (see list below)

<img src="https://github.com/hazae41/network-ws-to-tcp-proxy/assets/4405263/19c3c3a4-7833-4bf5-bd6c-3dac1e7f6e49" width="500" />

After deploy, if your hosting supports it, you can setup a custom domain with a wildcard.

e.g. `*.node0.hazae41.me` -> `mydocker.onrender.com`

#### Self-hosting

You just need 
- Docker (e.g. for [Ubuntu](https://docs.docker.com/engine/install/ubuntu/))
- Make (e.g. `sudo apt-get install make`)
- Git (e.g. `sudo apt-get install git`)

Then clone the repository (or fork-then-clone)

```bash
git clone --recurse-submodules https://github.com/hazae41/example-microserver <name> && cd ./<name>
```

Setup environment variables (see list below) by creating a `.env.local` file

```bash
cp ./.env.example ./.env.local && nano ./.env.local
```

You can then: 

- Build the latest commit and latest environment variables

```bash
make build
```

- Start and open console (kill with ctrl+c; close with ctrl+p then ctrl+q)

```bash
make start
```

- Show logs

```bash
make logs
```

- Open console (kill with ctrl+c; close with ctrl+p then ctrl+q)

```bash
make open
```

- Stop all instances

```bash
make stop
```

- Clean all builds

```bash
make clean
```

- Update to latest version

```bash
git reset --hard && git checkout $(git tag | sort -V | tail -1) 
```

You can enable HTTPS by either using Cloudflare as a HTTPS-to-HTTP reverse proxy, by configuring Nginx as a HTTPS-to-HTTP reverse proxy on your node, or by setting `CERT` and `KEY`.

### Environment variables

#### `PORT` (default to 8080)

**Don't set if cloud-hosting**

The exposed port

e.g. `8080`

#### `CERT` and `KEY` (optional)

**Don't set if cloud-hosting**

The paths to your TLS certificate and private key

e.g. `./tls/fullchain.pem` and `./tls/privkey.pem`

### Submodules

Each submodule is configured via environment variables with a dedicated prefix. And routes requests to it via wildcard DNS, URL path, HTTP headers, and more.

#### Adding a submodule

```bash
git submodule add https://github.com/<...> ./mods/<name>
```

e.g.

```bash
git submodule add https://github.com/hazae41/network-signaler.git ./mods/signal
```

#### Routing a submodule

You just have to edit `main.ts` to load your submodule and route to it depending on wildcard DNS, URL path, HTTP headers, or anything you want.

Import your module

```tsx
import * as Mainnet from "./mods/mainnet/mod.ts";
```

Choose a unique prefix for environment variables

```tsx
const mainnet = await Mainnet.main("MAINNET_")
```

Choose how to route requests to it

```tsx
const onHttpRequest = async (request: Request) => {
  if (request.headers.get("host")?.startsWith("mainnet."))
    return await mainnet.onHttpRequest(request)
  return new Response("Not Found", { status: 404 })
}
```

#### Configuring a submodule

If you're self-hosting, you can simply add a `.env.local` file in the submodule directory.

If you're cloud-hosting, you can use environment variables but with a dedicated prefix.

e.g. `PRIVATE_KEY_ZERO_HEX` becomes `MAINNET_PRIVATE_KEY_ZERO_HEX` if the prefix is `MAINNET_`

#### Updating all submodules

```bash
git submodule foreach git pull origin main
```