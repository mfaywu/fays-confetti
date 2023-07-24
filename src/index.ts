import { app, BrowserWindow, ipcMain, Menu, shell, dialog } from "electron";
import fs from "fs";
import { setupProtocol } from "./protocol";
import path from 'path';
// This allows TypeScript to pick up the magic constants that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

/**
 * Setting a menu
 * */
let mainBrowserWindow: BrowserWindow | null = null;
const isMac = process.platform === "darwin";

const template: Electron.MenuItemConstructorOptions[] | Electron.MenuItem[] = [
  // { role: 'appMenu' }
  ...((isMac
    ? [
        {
          label: app.name,
          submenu: [
            { role: "about" },
            { type: "separator" },
            { role: "services" },
            { type: "separator" },
            { role: "hide" },
            { role: "hideOthers" },
            { role: "unhide" },
            { type: "separator" },
            { role: "quit" },
          ],
        },
      ]
    : []) as Electron.MenuItemConstructorOptions[]),
  // { role: 'fileMenu' }
  {
    label: "File",
    submenu: [
      isMac ? { role: "close" } : { role: "quit" },
      { type: "separator" },
      {
        label: "Choose new image", // Future idea: save previously uploaded images
        click: async () => {
          const chooseImageAttempt = await dialog.showOpenDialog(
            mainBrowserWindow,
            {
              buttonLabel: "Choose image",
              filters: [{ name: "Images", extensions: ["jpg", "png", "gif"] }],
              properties: ["openFile"],
              message: "Choose an image to use as confetti",
            }
          );
          if (chooseImageAttempt.filePaths.length > 0) {
            fs.readFile(chooseImageAttempt.filePaths[0], (err, data) => {
              if (err) throw err;
              const appDataPath = app.getPath("userData");
              const newImage = Date.now() + path.extname(chooseImageAttempt.filePaths[0])
              const newImagePath = 
                appDataPath + "/images/" + newImage;

              fs.writeFile(newImagePath, data, {}, (err) => {
                // window.localStorage.setItem("image", newImage);  todo fix this
                const win = BrowserWindow.getFocusedWindow();
                win && win.webContents.send("set-image", newImage);
                if (err) throw err;
              });
            });
          }
        },
      },
    ] as Electron.MenuItemConstructorOptions[],
  },
  // { role: 'viewMenu' }
  {
    label: "View",
    submenu: [
      { role: "reload" },
      { role: "forceReload" },
      {
        label: "Toggle Developer Tools",
        accelerator: "Option+Command+I",
        click: async () => {
          // Redefine the toggleDevTools role.
          // We need to open in detached window because our main BrowserWindow is transparent and clicks are forwarded.
          if (mainBrowserWindow.webContents.isDevToolsOpened()) {
            mainBrowserWindow.webContents.closeDevTools();
          } else {
            mainBrowserWindow.webContents.openDevTools({ mode: "detach" });
          }
        },
      },
      { type: "separator" },
      { role: "resetZoom" },
      { role: "zoomIn" },
      { role: "zoomOut" },
      { type: "separator" },
      { role: "togglefullscreen" },
    ] as Electron.MenuItemConstructorOptions[],
  },
  // { role: 'windowMenu' }
  {
    label: "Window",
    submenu: [
      { role: "minimize" },
      ...(isMac
        ? [
            { type: "separator" },
            { role: "front" },
            { type: "separator" },
            { role: "window" },
          ]
        : [{ role: "close" }]),
    ] as Electron.MenuItemConstructorOptions[],
  },
  {
    role: "help",
    submenu: [
      {
        label: "Learn More",
        click: async () => {
          await shell.openExternal(
            "https://www.notion.so/faywu/fays-confetti-849842c346cc4084ba3f05b9aa91164a?pvs=4"
          );
        },
      },
    ],
  },
];
const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

const createWindow = async (): Promise<void> => {
  // We cannot require the screen module until the app is ready.
  const { screen } = await require("electron");

  // Create a window that fills the screen's available work area.
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  // Create the browser window.
  mainBrowserWindow = new BrowserWindow({
    height,
    width,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
    frame: false,
    transparent: true,
    hasShadow: false,
    icon: "./icon.png",
  });

  mainBrowserWindow.setAlwaysOnTop(true, "floating");

  mainBrowserWindow.setIgnoreMouseEvents(true, { forward: true });

  // and load the index.html of the app.
  mainBrowserWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  mainBrowserWindow.once("ready-to-show", () => {

    // TODO: fix, this doesn't work
    // Check if localStorage already has a chosen image
    // const savedImage = window.localStorage.getItem('image');
    // if(fs.existsSync(savedImage)) { mainBrowserWindow.webContents.send('set-image', savedImage); })})

    // Otherwise, use the default Behr image
    const appDataPath = app.getPath("userData");
    const behr = 'behr.png'
    const behrImgPath = appDataPath + "/images/" + behr;

    // Check if images folder exists, create if not
    if (!fs.existsSync(appDataPath + '/images')) {
      fs.mkdirSync(appDataPath + '/images');
    }

    // Check if this behr image file (the default image for Raining Dogs) exists already
    if (!fs.existsSync(appDataPath + "/images/" + behr)) {
      // If not, copy the behr image file from the app's resources folder
      fs.readFile(path.join(process.cwd(), "./src/" + behr), (err, data) => {
        if (err) throw err;

        fs.writeFile(behrImgPath, data, {}, (err) => { 
          if (err) throw err;
        });
      });
    }

    // Save the default Behr image path to localStorage
    // window.localStorage.setItem("image", newImagePath); 
    mainBrowserWindow.webContents.send("set-image", behr);
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
  setupProtocol();
  createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

ipcMain.on("set-ignore-mouse-events", (event, ignore, options) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  win && win.setIgnoreMouseEvents(ignore, options);
});
