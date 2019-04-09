// @ts-ignore 
const electron = require('electron');

const { app, ipcMain, BrowserWindow } = electron;

const fs = require('fs');
const path = require('path');
const url = require('url');
const FormData = require('form-data');

let mainWindow;

// required for Notifications on Windows 10
app.setAppUserModelId(process.execPath);

const createWindow = () => {
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: false,
            preload: __dirname + '/preload.js'
        },
        width: 400,
        height: 350,
        frame: false,
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

ipcMain.on('focusWindow', () => {
    // which window? Maybe some future clipboard window...
    mainWindow.show();
    mainWindow.focus();
});

ipcMain.on('file-drop', (_, filePath) => {
    let form = new FormData();
    form.append('file', fs.createReadStream(filePath));

    sendToWeb('status', {
        status: 'uploading',
    });

    form.submit('http://storage.hotdang.ca/api/v1/file', function(err, res, body) {
        // res – response object (http.IncomingMessage)  //
        let responseData = '';

        res.on('data', (chunk) => {
            responseData += chunk;
        });

        res.on('end', () => {
            if (res && res.statusCode) {
                if (res.statusCode !== 200) {
                    sendToWeb('status', {
                        status: 'failure',
                        error: res.statusMessage,
                    });
                } else {
                    const locationData = JSON.parse(responseData);
                    const {location } = locationData;
                    sendToWeb('status', {
                        status: 'success',
                        location,
                    });
                }
            }
        });

        res.resume();
    });
});