const { session, app, ipcMain, BrowserWindow } = require("electron");
const path = require("path");

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
    // eslint-disable-line global-require
    app.quit();
}
const clientId = "01c3d6de4bee4b868796a1d3a61084f7";

const redirect_uri = "https://google.com";

const authURL = encodeURI(
    `https://accounts.spotify.com/authorize?client_id=${clientId}&redirect_uri=${redirect_uri}&response_type=token`
);

const filter = {
    urls: ["*localhost"],
};

const createWindow = () => {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
        },
    });

    // and load the index.html of the app.
    mainWindow.loadFile(path.join(__dirname, "index.html"));

    // Open the DevTools.
    mainWindow.webContents.openDevTools();

    ipcMain.on("auth-start", async () => {
        const auth = new BrowserWindow({ x: 60, y: 60, useContentSize: true });
        const token = await getTokenFromAuth(auth, authURL).catch((err) =>
            console.error({ err })
        );
        console.log({ token });
        auth.close();
        mainWindow.send("auth-success", token);
    });
};

async function getTokenFromAuth(authWindow, authPageUrl) {
    console.log(authPageUrl);
    authWindow.loadURL(authPageUrl);
    authWindow.webContents.openDevTools();
    let token = undefined;

    return new Promise((resolve, reject) => {
        session.defaultSession.webRequest.onBeforeRequest(
            { urls: [] },
            (details, callback) => {
                console.log({ details: JSON.parse(JSON.stringify(details)) });
                if (details.url.includes("access_token")) {
                    const url = new URL(details.url.replace("#", "?"));
                    let token = url.searchParams.get("access_token");
                    resolve(token);
                    return callback({ cancel: true });
                }
                return callback({ cancel: false });
            }
        );

        const onclosed = () => {
            reject("Interaction ended intentionally ;(");
        };
        authWindow.on("closed", onclosed);
    });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

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
