"use strict";const{contextBridge:e,ipcRenderer:r}=require("electron");e.exposeInMainWorld("electron",{requestCameraAccess:()=>r.invoke("request-camera-access")});
