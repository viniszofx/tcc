import { app as e, BrowserWindow as t } from "electron";
import n from "path";
import { fileURLToPath as l } from "url";
const i = n.dirname(l(import.meta.url));
let r = !1, o;
e.whenReady().then(() => {
  o = new t({
    title: "Main window",
    webPreferences: {
      nodeIntegration: !1,
      contextIsolation: !0,
      preload: n.join(i, "preload.js"),
      webSecurity: !0,
      sandbox: !0
    }
  }), process.env.VITE_DEV_SERVER_URL ? o.loadURL(process.env.VITE_DEV_SERVER_URL) : o.loadURL("http://localhost:4173/"), o.on("close", (s) => {
    r || (r = !0, console.log("Fechando a janela..."), s.preventDefault(), o && o.destroy(), setTimeout(() => {
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
  t.getAllWindows().length === 0 && createWindow();
});
