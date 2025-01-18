import { app, BrowserWindow } from "electron";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
let isClosing = false;
let win;
app.whenReady().then(() => {
  win = new BrowserWindow({
    title: "Main window",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.mjs"),
      webSecurity: true,
      sandbox: true
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
