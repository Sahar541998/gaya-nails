import { createServer } from "node:http";

const port = Number.parseInt(process.env.PORT ?? "4010", 10);
const mockCode = process.env.MOCK_CODE ?? "000000";

function readJson(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      if (chunks.length === 0) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function send(res, status, body) {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(body));
}

const server = createServer((req, res) => {
  void (async () => {
    const url = new URL(req.url ?? "/", "http://sms-mock.local");

    if (req.method === "GET" && url.pathname === "/health") {
      send(res, 200, { ok: true });
      return;
    }

    if (req.method === "POST" && url.pathname === "/verifications") {
      await readJson(req);
      send(res, 200, { status: "pending" });
      return;
    }

    if (req.method === "POST" && url.pathname === "/checks") {
      const body = await readJson(req);
      const approved = body.code === mockCode;
      send(res, 200, { approved });
      return;
    }

    send(res, 404, { error: "not_found" });
  })().catch(() => {
    send(res, 400, { error: "bad_request" });
  });
});

server.listen(port, () => {
  console.info(`sms-mock listening on ${port}`);
});
