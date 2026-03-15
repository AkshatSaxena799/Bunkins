const fs = require("fs");
const path = require("path");
const { spawn, spawnSync } = require("child_process");

const ROOT = process.cwd();
const isWindows = process.platform === "win32";

function runSync(command, args, options = {}) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    cwd: ROOT,
    shell: false,
    ...options,
  });

  if (result.error || result.status !== 0) {
    process.exit(result.status || 1);
  }
}

function resolveVenvPython() {
  return path.join(
    ROOT,
    "backend",
    ".venv",
    isWindows ? "Scripts" : "bin",
    isWindows ? "python.exe" : "python"
  );
}

function ensureVenv() {
  const venvPython = resolveVenvPython();
  if (fs.existsSync(venvPython)) {
    return venvPython;
  }

  // Try python first, then py -3 on Windows as a fallback.
  let created = false;
  let result = spawnSync("python", ["-m", "venv", path.join("backend", ".venv")], {
    stdio: "inherit",
    cwd: ROOT,
    shell: false,
  });

  if (!result.error && result.status === 0) {
    created = true;
  }

  if (!created && isWindows) {
    result = spawnSync("py", ["-3", "-m", "venv", path.join("backend", ".venv")], {
      stdio: "inherit",
      cwd: ROOT,
      shell: false,
    });
    if (!result.error && result.status === 0) {
      created = true;
    }
  }

  if (!created) {
    process.exit(1);
  }

  return resolveVenvPython();
}

function main() {
  const venvPython = ensureVenv();

  runSync(venvPython, ["-m", "pip", "install", "-r", path.join("backend", "requirements.txt")]);
  runSync("npm", ["--prefix", "frontend", "install", "--no-audit", "--no-fund"], {
    shell: isWindows,
  });
  runSync("npm", ["--prefix", "frontend", "run", "build"], {
    shell: isWindows,
  });

  const backend = spawn(venvPython, [path.join("backend", "main.py")], {
    stdio: "inherit",
    cwd: ROOT,
    shell: false,
  });

  const shutdown = (signal) => {
    if (!backend.killed) {
      backend.kill(signal);
    }
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));

  backend.on("exit", (code) => {
    process.exit(code == null ? 0 : code);
  });
}

main();
