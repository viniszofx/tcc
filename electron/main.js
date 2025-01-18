import { app, BrowserWindow } from "electron";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let isClosing = false; // Para evitar múltiplos fechamentos
let win; // Mantém a referência da janela

app.whenReady().then(() => {
  win = new BrowserWindow({
    title: "Main window",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
      webSecurity: true,
      sandbox: true,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    win.loadURL("http://localhost:4173/");
  }

  // Quando a janela for fechada
  win.on("close", (event) => {
    if (isClosing) return; // Impede múltiplos fechamentos
    isClosing = true; // Marca como fechado
    console.log("Fechando a janela...");
    event.preventDefault(); // Previne o fechamento imediato

    if (win) {
      win.destroy(); // Destrói a janela
    }

    // Verifica se o processo ainda está ativo antes de tentar chamar app.quit()
    setTimeout(() => {
      if (!app.isQuiting) {
        app.quit(); // Chama app.quit depois do fechamento da janela, se não estiver em processo de fechamento
      }
    }, 200);
  });

  // Quando todas as janelas forem fechadas
  app.on("window-all-closed", () => {
    console.log("Fechando todos os processos...");
    if (process.platform !== "darwin") {
      app.exit(0); // Finaliza o processo imediatamente
    }
  });

  // Mensagens de preparação e encerramento
  app.on("before-quit", () => {
    console.log("Electron está se preparando para encerrar...");
  });

  app.on("will-quit", () => {
    console.log("Electron está prestes a encerrar...");
  });

  // Quando o Electron estiver completamente encerrado
  app.on("quit", () => {
    console.log("Processo Electron encerrado com sucesso.");
  });
});

// Para macOS
if (process.platform === "darwin") {
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow(); // Cria uma janela se não houver
    }
  });
}
