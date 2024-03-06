import * as Dotenv from "https://deno.land/std@0.217.0/dotenv/mod.ts";
import * as JsonRpc from "./mods/network-json-rpc-guard/mod.ts";
import * as Signal from "./mods/network-signaler/mod.ts";

const envPath = new URL(import.meta.resolve("./.env.local")).pathname

const {
  PORT = Deno.env.get("PORT") || "8080",
  CERT = Deno.env.get("CERT"),
  KEY = Deno.env.get("KEY"),
} = await Dotenv.load({ envPath, examplePath: null })

const signal = await Signal.main("SIGNAL_")
const mainnet = await JsonRpc.main("MAINNET_")

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

Deno.serve({ hostname: "0.0.0.0", port: Number(PORT), cert: CERT, key: KEY }, onHttpRequest)