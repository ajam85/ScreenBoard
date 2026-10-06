const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('sel', {
  get: () => ipcRenderer.invoke('sel-get'),
  ready: () => ipcRenderer.send('sel-ready'),
  fail: () => ipcRenderer.send('sel-fail'),
  done: (r, v, why) => ipcRenderer.send('sel-done', r, v, why)
});
