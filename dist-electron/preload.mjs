"use strict";
const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("electron", {
  requestCameraAccess: () => ipcRenderer.invoke("request-camera-access")
});
