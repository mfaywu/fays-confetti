// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const { ipcRenderer } = require("electron");

window.addEventListener("DOMContentLoaded", () => {
  const el = document.getElementById("image-confetti");
  el && el.addEventListener("mouseenter", () => {
    ipcRenderer.send("set-ignore-mouse-events", false);
  });
  el && el.addEventListener("mouseleave", () => {
    ipcRenderer.send("set-ignore-mouse-events", true, { forward: true });
  });
});
