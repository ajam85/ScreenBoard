const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('api', {
  dir: () => ipcRenderer.sendSync('dir'),
  load: () => ipcRenderer.invoke('load'),
  save: s => ipcRenderer.send('save', s),
  capture: () => ipcRenderer.send('capture'),
  captureRegion: () => ipcRenderer.send('capture-region'),
  openFolder: () => ipcRenderer.send('open-folder'),
  getSettings: () => ipcRenderer.invoke('settings-get'),
  setSettings: s => ipcRenderer.invoke('settings-set', s),
  diag: () => ipcRenderer.invoke('diag'),
  deleteFiles: n => ipcRenderer.invoke('delete-files', n),
  reportPdf: r => ipcRenderer.invoke('report-pdf', r),
  reportMd: r => ipcRenderer.invoke('report-md', r),
  readPng: n => ipcRenderer.invoke('read-png', n),
  writePng: d => ipcRenderer.invoke('write-png', d),
  saveAs: n => ipcRenderer.invoke('save-as', n),
  onError: cb => ipcRenderer.on('err', (_, m) => cb(m)),
  onShot: cb => ipcRenderer.on('shot', (_, f) => cb(f))
});
