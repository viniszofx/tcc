import { app as e, BrowserWindow as n, ipcMain as i } from "electron";
import s from "path";
import { fileURLToPath as l } from "url";
const c = s.dirname(l(import.meta.url));
let t = !1, o;
e.whenReady().then(() => {
  o = new n({
    title: "App Cadê",
    icon: s.join("public", "logo.jpg"),
    alwaysOnTop: !0,
    webPreferences: {
      nodeIntegration: !1,
      contextIsolation: !0,
      preload: s.join(c, "preload.mjs"),
      webSecurity: !0,
      sandbox: !0
    }
  }), o.webContents.session.webRequest.onHeadersReceived((r, a) => {
    a({
      responseHeaders: {
        ...r.responseHeaders,
        "Content-Security-Policy": [
          "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://github.com https://avatars.githubusercontent.com;"
        ]
      }
    });
  }), i.handle("request-camera-access", async () => {
    try {
      const r = await navigator.mediaDevices.getUserMedia({ video: !0 });
      return !0;
    } catch (r) {
      return console.error("Erro ao acessar a câmera", r), !1;
    }
  }), process.env.VITE_DEV_SERVER_URL ? o.loadURL(process.env.VITE_DEV_SERVER_URL) : o.loadURL("http://localhost:4173/"), o.on("close", (r) => {
    t || (t = !0, console.log("Fechando a janela..."), r.preventDefault(), o && o.destroy(), setTimeout(() => {
      e.isQuiting || e.quit();
    }, 200));
  }), e.on("window-all-closed", () => {
    console.log("Fechando todos os processos..."), process.platform !== "darwin" && e.exit(0);
  }), e.on("before-quit", () => {
    console.log("Electron está se preparando para encerrar...");
  }), e.on("will-quit", () => {
    console.log("Electron está prestes a encerrar...");
  }), e.on("quit", () => {
    console.log("Processo Electron encerrado com sucesso.");
  });
});
process.platform === "darwin" && e.on("activate", () => {
  n.getAllWindows().length === 0 && createWindow();
});
