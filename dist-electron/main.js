import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
let isClosing = false;
let win;
app.whenReady().then(() => {
  win = new BrowserWindow({
    title: "App Cadê",
    icon: path.join("public", "logo.jpg"),
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.mjs"),
      webSecurity: true,
      sandbox: true
    }
  });
  win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Content-Security-Policy": [
          "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://github.com https://avatars.githubusercontent.com;"
        ]
      }
    });
  });
  ipcMain.handle("request-camera-access", async () => {
    try {
      const result = await navigator.mediaDevices.getUserMedia({ video: true });
      return true;
    } catch (error) {
      console.error("Erro ao acessar a câmera", error);
      return false;
    }
  });
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    win.loadURL("http://localhost:4173/");
  }
  win.on("close", (event) => {
    if (isClosing) return;
    isClosing = true;
    console.log("Fechando a janela...");
    event.preventDefault();
    if (win) {
      win.destroy();
    }
    setTimeout(() => {
      if (!app.isQuiting) {
        app.quit();
      }
    }, 200);
  });
  app.on("window-all-closed", () => {
    console.log("Fechando todos os processos...");
    if (process.platform !== "darwin") {
      app.exit(0);
    }
  });
  app.on("before-quit", () => {
    console.log("Electron está se preparando para encerrar...");
  });
  app.on("will-quit", () => {
    console.log("Electron está prestes a encerrar...");
  });
  app.on("quit", () => {
    console.log("Processo Electron encerrado com sucesso.");
  });
});
if (process.platform === "darwin") {
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
}
