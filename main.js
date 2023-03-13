const { app, BrowserWindow, screen, globalShortcut, dialog, Tray,  Menu } = require("electron");
const path = require("path");

let tray = null;
let mainWindow = null;
let lastPressTime = 0;

app.commandLine.appendSwitch("wm-window-animations-disabled");

function createTray() {
  tray = new Tray(path.join(__dirname, "src/icon.ico"));
  tray.setToolTip("Confetti");
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "显示",
      click: () => {
        mainWindow.show();
      }
    },
    {
      label: "退出",
      click: () => {
        app.quit();
      }
    }
  ]);
  tray.setContextMenu(contextMenu);
  tray.on("click", () => {
    if (!mainWindow.isVisible()) {
      mainWindow.show();
    } else {
      mainWindow.hide();
    }
  });
}

function createBrowserWindow(options) {
  const window = new BrowserWindow(options);
  window.loadFile(options.loadFile);
  return window;
}

function createMainWindow() {
  const mainWindow = new BrowserWindow({
    width: 400,
    height: 250,
    maximizable: false,
    resizable: false,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile("src/index.html");

  mainWindow.on("close", (event) => {
    event.preventDefault();
    dialog
      .showMessageBox({
        type: "question",
        buttons: ["最小化", "关闭软件"],
        title: "确认",
        message: "确认关闭？"
      })
      .then((result) => {
        if (result.response === 0) {
          event.preventDefault();
          mainWindow.hide();
        } else {
          mainWindow.destroy();
        }
      });
  });

  return mainWindow;
}

function createWindow() {
  return createBrowserWindow({
    ...screen.getPrimaryDisplay().workAreaSize,
    frame: false,
    transparent: true,
    resizable: false,
    webPreferences: {
      nodeIntegration: true
    },
    loadFile: "src/confetti.html"
  });
}

function registerGlobalShortcut() {
  globalShortcut.register("Ctrl+I", () => {
    if (Date.now() - lastPressTime < 7500) {
      return;
    }
    lastPressTime = Date.now();
    const window = createWindow();
    window.show();
    setTimeout(() => {
      window.close();
    }, 7500);
  });
}

app.whenReady().then(() => {
  createTray();
  mainWindow = createMainWindow();
  registerGlobalShortcut();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    mainWindow = createMainWindow();
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  app.isQuitting = true;
});

app.on("will-quit", () => {
  // 在这里清理和关闭应用程序使用的任何资源和连接。
  globalShortcut.unregisterAll();
  
});
