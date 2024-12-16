const path = require("path");
const expressApp = require("./server"); // Import the Express app

// Electron 부분: Electron 환경에서만 실행
if (process.versions && process.versions.electron) {
  const { app, BrowserWindow } = require("electron");

  let mainWindow;

  const createWindow = () => {
    mainWindow = new BrowserWindow({
      width: 800,
      height: 800,
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
      },
    });
    mainWindow.setMenuBarVisibility(false);
    mainWindow.loadURL("http://localhost:8080");

    mainWindow.on("closed", () => {
      mainWindow = null;
    });
  };

  app.whenReady().then(() => {
    createWindow();
    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });
}

// Express 서버 부분
const PORT = process.env.PORT || 8080;
expressApp.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
