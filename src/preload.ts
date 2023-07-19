// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { ipcRenderer } from "electron";

window.addEventListener("DOMContentLoaded", () => {
  const elements = document.getElementsByClassName("image-confetti");
  for (const el of elements) {
    el && el.addEventListener("mouseenter", () => {
      ipcRenderer.send("set-ignore-mouse-events", false);
    });
    el && el.addEventListener("mouseleave", () => {
      ipcRenderer.send("set-ignore-mouse-events", true, { forward: true })
    });
  }
});
