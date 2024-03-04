import * as Dotenv from "https://deno.land/std@0.217.0/dotenv/mod.ts";
import * as JsonRpcGuard from "./mods/network-json-rpc-guard/mod.ts";
import * as WsToTcpProxy from "./mods/network-ws-to-tcp-proxy/mod.ts";

const envPath = new URL(import.meta.resolve("./.env.local")).pathname

const {
  PORT = Deno.env.get("PORT") || "8080",
  CERT = Deno.env.get("CERT"),
  KEY = Deno.env.get("KEY"),
} = await Dotenv.load({ envPath, examplePath: null })

const wsToTcpProxy = await WsToTcpProxy.main()
const jsonRpcGuard = await JsonRpcGuard.main()

const onHttpRequest = async (request: Request) => {
  if (request.headers.get("host")?.startsWith("ws-to-tcp."))
    return await wsToTcpProxy.onHttpRequest(request)
  if (request.headers.get("host")?.startsWith("json-rpc."))
    return await jsonRpcGuard.onHttpRequest(request)

  const url = new URL(request.url)

  if (url.pathname === "/ws-to-tcp")
    return await wsToTcpProxy.onHttpRequest(request)
  if (url.pathname === "/json-rpc")
    return await jsonRpcGuard.onHttpRequest(request)

  return new Response("Not Found", { status: 404 })
}

Deno.serve({ hostname: "0.0.0.0", port: Number(PORT), cert: CERT, key: KEY }, onHttpRequest)