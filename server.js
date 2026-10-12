import http from "http";
import fs from "fs";
import { promises as fsp } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { initDb } from "./config/db.js";
import { handleApiRoutes } from "./routes/apiRoutes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, "../Frontend/dist");

const PORT = process.env.PORT || 5000;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".txt": "text/plain; charset=utf-8",
};

function setCorsHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

async function parseBody(req) {
  return new Promise((resolve) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch {
        resolve({});
      }
    });
  });
}

async function tryServeStatic(res, pathname) {
  try {
    if (!fs.existsSync(distDir)) {
      return false;
    }

    let cleanPath = pathname;
    if (cleanPath === "/" || !cleanPath) {
      cleanPath = "/index.html";
    }

    // Prevent directory traversal
    const safePath = path.normalize(cleanPath).replace(/^(\.\.[\/\\])+/, "");
    let targetFile = path.join(distDir, safePath);

    let stat;
    try {
      stat = await fsp.stat(targetFile);
      if (stat.isDirectory()) {
        targetFile = path.join(targetFile, "index.html");
        stat = await fsp.stat(targetFile);
      }
    } catch {
      // Check if targetFile without extension matches an HTML file (e.g. /login -> /login.html)
      if (!path.extname(targetFile)) {
        try {
          const withHtml = targetFile + ".html";
          stat = await fsp.stat(withHtml);
          if (stat.isFile()) {
            targetFile = withHtml;
          }
        } catch {
          return false;
        }
      } else {
        return false;
      }
    }

    if (stat && stat.isFile()) {
      const ext = path.extname(targetFile).toLowerCase();
      const contentType = MIME_TYPES[ext] || "application/octet-stream";
      const content = await fsp.readFile(targetFile);

      if (ext === ".html") {
        res.setHeader("Cache-Control", "no-cache");
      } else {
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      }

      res.writeHead(200, { "Content-Type": contentType });
      res.end(content);
      return true;
    }
  } catch (err) {
    console.error("Static serve error:", err);
  }
  return false;
}

const server = http.createServer(async (req, res) => {
  setCorsHeaders(res);

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const pathname = parsedUrl.pathname;

  if (req.method === "POST" || req.method === "PUT") {
    req.body = await parseBody(req);
  } else {
    req.body = {};
  }
  req.query = Object.fromEntries(parsedUrl.searchParams.entries());

  // Handle API routes
  if (pathname.startsWith("/api")) {
    try {
      const handled = await handleApiRoutes(req, res, pathname);
      if (!handled) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            error: "Not Found",
            message: `Endpoint ${req.method} ${pathname} not found`,
          })
        );
      }
    } catch (error) {
      console.error("Server Error:", error);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          error: "Internal Server Error",
          message: error.message,
        })
      );
    }
    return;
  }

  // Handle static Frontend files in production
  if (req.method === "GET" || req.method === "HEAD") {
    const served = await tryServeStatic(res, pathname);
    if (served) return;

    // Fallback for clean SPA routes
    if (!path.extname(pathname)) {
      const fallbackServed = await tryServeStatic(res, "/index.html");
      if (fallbackServed) return;
    }
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify({
      error: "Not Found",
      message: `Endpoint ${req.method} ${pathname} not found`,
    })
  );
});

await initDb();

server.listen(PORT, "0.0.0.0", () => {
  console.log(`🐾 Pet Care Planner running at http://0.0.0.0:${PORT}`);
  console.log(`   Health check: http://0.0.0.0:${PORT}/api/status`);
});

export default server;

