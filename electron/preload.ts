const { contextBridge, ipcRenderer } = require("electron");

// Expondo as APIs de câmera para o frontend
contextBridge.exposeInMainWorld("electron", {
  requestCameraAccess: () => ipcRenderer.invoke("request-camera-access"),
});
