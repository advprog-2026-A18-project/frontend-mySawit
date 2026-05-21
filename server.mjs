import { createReadStream, existsSync } from 'node:fs';
import { stat } from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, 'dist');
const port = Number(process.env.PORT || 5173);
const gatewayUrl = new URL(process.env.GATEWAY_TARGET || 'http://api-gateway:8080');

const mimeTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.ico', 'image/x-icon'],
]);

function proxyToGateway(req, res) {
  const targetPath = req.url.replace(/^\/gateway/, '') || '/';
  const headers = { ...req.headers, host: gatewayUrl.host };
  delete headers.connection;

  const proxyReq = http.request(
    {
      hostname: gatewayUrl.hostname,
      port: gatewayUrl.port || 80,
      path: targetPath,
      method: req.method,
      headers,
    },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 502, proxyRes.headers);
      proxyRes.pipe(res);
    },
  );

  proxyReq.on('error', (error) => {
    res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ message: `Gateway proxy failed: ${error.message}` }));
  });

  req.pipe(proxyReq);
}

async function serveStatic(req, res) {
  const requestPath = decodeURIComponent(new URL(req.url, `http://localhost:${port}`).pathname);
  const safePath = path.normalize(requestPath).replace(/^(\.\.[/\\])+/, '');
  let filePath = path.join(distDir, safePath);

  try {
    const fileStat = await stat(filePath);
    if (fileStat.isDirectory()) filePath = path.join(filePath, 'index.html');
  } catch {
    filePath = path.join(distDir, 'index.html');
  }

  if (!existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
    return;
  }

  const contentType = mimeTypes.get(path.extname(filePath)) || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': contentType });
  createReadStream(filePath).pipe(res);
}

http
  .createServer((req, res) => {
    if (req.url?.startsWith('/gateway/')) {
      proxyToGateway(req, res);
      return;
    }
    serveStatic(req, res);
  })
  .listen(port, '0.0.0.0', () => {
    console.log(`Frontend listening on http://localhost:${port}`);
  });
