const { app, BrowserWindow } = require("electron");
const path = require("path");
const expressApp = require("./server"); // Import the Express app

let mainWindow;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"), // Optional preload script
    },
  });

  // Load the Express server URL
  mainWindow.loadURL("http://localhost:8080");

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
};

app.whenReady().then(() => {
  // Start the Express server
  expressApp.listen(8080, () => {
    console.log("Express server running on http://localhost:8080");
  });

  // Create the Electron window
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
