import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendDir = path.resolve(__dirname, '..', 'backend');

// Track whether backend was already launched this session
let launched = false;

/**
 * Vite plugin: adds a /api/launch-backend endpoint.
 * When the frontend calls it, Node spawns uvicorn in a new terminal window.
 */
function backendLauncherPlugin() {
  return {
    name: 'vega-backend-launcher',
    configureServer(server) {
      server.middlewares.use('/api/launch-backend', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');

        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          res.end();
          return;
        }

        if (launched) {
          res.statusCode = 200;
          res.end(JSON.stringify({ status: 'already_running' }));
          return;
        }

        try {
          const isWindows = process.platform === 'win32';

          if (isWindows) {
            // Opens a new cmd window with uvicorn running inside
            spawn(
              'cmd.exe',
              [
                '/c', 'start', '"VEGA Backend"', 'cmd', '/k',
                `cd /d "${backendDir}" && echo. && echo  VEGA Backend — http://localhost:8000 && echo. && python -m uvicorn api:app --reload --host 0.0.0.0 --port 8000`,
              ],
              { detached: true, stdio: 'ignore', shell: false }
            ).unref();
          } else {
            // macOS: open in Terminal.app
            // Linux: try gnome-terminal then xterm fallback
            const script = `cd "${backendDir}" && python -m uvicorn api:app --reload`;
            if (process.platform === 'darwin') {
              spawn('osascript', [
                '-e', `tell application "Terminal" to do script "${script}"`
              ], { detached: true, stdio: 'ignore' }).unref();
            } else {
              spawn('bash', ['-c', `gnome-terminal -- bash -c '${script}; exec bash' || xterm -e '${script}'`],
                { detached: true, stdio: 'ignore' }).unref();
            }
          }

          launched = true;
          res.statusCode = 200;
          res.end(JSON.stringify({ status: 'launched' }));
          console.log('\n\x1b[32m[VEGA]\x1b[0m Backend launcher triggered — uvicorn starting in new terminal\n');

        } catch (err) {
          res.statusCode = 500;
          res.end(JSON.stringify({ status: 'error', message: err.message }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), backendLauncherPlugin()],
  server: {
    port: 5173,
  },
});
