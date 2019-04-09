// @ts-ignore 
const electron = require('electron');

const { app, ipcMain, BrowserWindow } = electron;
const path = require('path');
const url = require('url');

let mainWindow;

const createWindow = () => {
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: false,
            preload: __dirname + '/preload.js'
        },
        width: 800,
        height: 600,
    });

    mainWindow.loadURL(
        process.env.ELECTRON_START_URL || 
            url.format({
                pathname: path.join(__dirname, '../public/index.html'),
                protocol: 'file:',
                slashes: true,
            })
    );

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

const sendToWeb = (tag, data) => {
    mainWindow.webContents.send(tag, data);
};
