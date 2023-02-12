import { app, BrowserWindow, shell } from 'electron';
import * as path from 'path';
// import installExtension, {
//     REDUX_DEVTOOLS,
//     REACT_DEVELOPER_TOOLS,
// } from 'electron-devtools-installer';
import electronReload from 'electron-reload';
import windowStateKeeper from 'electron-window-state';

let mainWindow: BrowserWindow | null = null;

const createWindow = () => {
    let mainWindowState = windowStateKeeper({
        defaultWidth: 1000,
        defaultHeight: 800,
    });

    // Create the window using the state information
    mainWindow = new BrowserWindow({
        x: mainWindowState.x,
        y: mainWindowState.y,
        width: mainWindowState.width,
        height: mainWindowState.height,
        icon: 'favicon.png',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    // Open urls in the user's browser
    mainWindow.webContents.setWindowOpenHandler((edata) => {
        shell.openExternal(edata.url);
        return { action: 'deny' };
    });

    // Let us register listeners on the window, so we can update the window state
    // automatically (the listeners will be removed when the window is closed)
    // and restore the maximized or full screen state
    mainWindowState.manage(mainWindow);

    if (app.isPackaged) {
        // load file: 'lib/index.html'
        mainWindow.loadURL(`file://${__dirname}/index.html`);
    } else {
        mainWindow.loadURL(`file://${__dirname}/../renderer/index.html`);

        // DevTools Extensions
        // currently not working due to this issue: https://github.com/electron/electron/issues/36545
        // mainWindow.webContents.once('dom-ready', async () => {
        //     await installExtension([REDUX_DEVTOOLS, REACT_DEVELOPER_TOOLS])
        //         .then((name) => console.log(`Added Extension:  ${name}`))
        //         .catch((err) => console.log('An error occurred: ', err))
        //         .finally(() => {
        //             mainWindow.webContents.openDevTools();
        //         });
        // });

        // Hot Reloading on 'node_modules/.bin/electronPath'
        electronReload(__dirname, {
            electron: path.join(
                __dirname,
                '..',
                '..',
                '..',
                '..',
                'node_modules',
                '.bin',
                'electron' + (process.platform === 'win32' ? '.cmd' : '')
            ),
            // forceHardReset: true,
            electronArgv: ['--remote-debugging-port=9223 --inspect'],
            hardResetMethod: 'exit',
        });
    }
};

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });

    // Quit when all windows are closed, except on macOS. There, it's common
    // for applications and their menu bar to stay active until the user quits
    // explicitly with Cmd + Q.
    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            app.quit();
        }
    });
});
