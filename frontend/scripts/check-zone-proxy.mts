// Integration check for shared/zone-proxy.ts (`npx tsx scripts/check-zone-proxy.mts`):
// a synthetic upstream exercising the paths a live login would — multiple
// Set-Cookie headers (incl. __Host-), split <body> tag across chunks, redirect
// passthrough, non-HTML passthrough, unreachable upstream, zone-disabled 404.
import { createServer } from "node:http";
import assert from "node:assert";
import { proxyZone } from "../shared/zone-proxy";

const server = createServer((req, res) => {
  if (req.url === "/set-cookies") {
    res.setHeader("Set-Cookie", [
      "__Host-session=abc; Path=/; Secure; HttpOnly; SameSite=Lax",
      "csrf=xyz; Path=/",
    ]);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.write("<!DOCTYPE html><html><hea");
    setTimeout(() => {
      res.write('d><title>t</title></head><bo');
      setTimeout(() => res.end("dy><main>hello</main></body></html>"), 10);
    }, 10);
    return;
  }
  if (req.url === "/redir") {
    res.statusCode = 302;
    res.setHeader("Location", "/cabinet/login");
    res.end();
    return;
  }
  res.setHeader("Content-Type", "application/json");
  res.end('{"ok":true}');
});
await new Promise<void>((r) => server.listen(18517, r));
const up = "http://127.0.0.1:18517";

const html = await proxyZone(new Request("http://conductor.test/set-cookies"), up);
const cookies = html.headers.getSetCookie();
assert.equal(cookies.length, 2, "both Set-Cookie forwarded individually");
assert.ok(cookies[0].startsWith("__Host-session="), cookies[0]);
const body = await html.text();
assert.ok(/<head[^>]*><link rel="stylesheet" href="\/shell\/header\./.test(body), "head insert after split tag");
assert.ok(/<body[^>]*><header data-slot="header"/.test(body), "body insert after split tag");
assert.ok(body.endsWith("</html>"), "tail passes through");

const redir = await proxyZone(new Request("http://conductor.test/redir"), up);
assert.equal(redir.status, 302);
assert.equal(redir.headers.get("location"), "/cabinet/login");

const json = await proxyZone(new Request("http://conductor.test/data"), up);
assert.equal(await json.text(), '{"ok":true}', "non-HTML byte-identical");

const dead = await proxyZone(new Request("http://conductor.test/x"), "http://127.0.0.1:1");
assert.equal(dead.status, 502);

const off = await proxyZone(new Request("http://conductor.test/x"), undefined);
assert.equal(off.status, 404);

server.close();
console.log("proxy-cookie-check: all assertions passed");
