import * as Dotenv from "https://deno.land/std@0.217.0/dotenv/mod.ts";
import * as Mainnet from "./mods/mainnet/mod.ts";
import * as Signal from "./mods/signal/mod.ts";

const envPath = new URL(import.meta.resolve("./.env.local")).pathname

const {
  PORT = Deno.env.get("PORT") || "8080",
  CERT = Deno.env.get("CERT"),
  KEY = Deno.env.get("KEY"),
} = await Dotenv.load({ envPath, examplePath: null })

const port = Number(PORT)

const cert = CERT != null
  ? Deno.readTextFileSync(CERT)
  : undefined

const key = KEY != null
  ? Deno.readTextFileSync(KEY)
  : undefined

const signal = await Signal.main("SIGNAL_")
const mainnet = await Mainnet.main("MAINNET_")

const onHttpRequest = async (request: Request) => {
  if (request.headers.get("host")?.startsWith("signal."))
    return await signal.onHttpRequest(request)
  if (request.headers.get("host")?.startsWith("mainnet."))
    return await mainnet.onHttpRequest(request)

  const url = new URL(request.url)

  if (url.pathname === "/signal")
    return await signal.onHttpRequest(request)
  if (url.pathname === "/mainnet")
    return await mainnet.onHttpRequest(request)

  return new Response("Not Found", { status: 404 })
}

Deno.serve({ hostname: "0.0.0.0", port, cert, key }, onHttpRequest)