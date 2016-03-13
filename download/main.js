'use strict';

const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

const fs = require('fs');
const serverURL = "http://*ADD IP OF SERVER*:3000";
var request = require('request');
var progress = require("request-progress");
// var options = {
//   url: 'http://releases.ubuntu.com/14.04.4/ubuntu-14.04.4-desktop-amd64.iso',
//   headers: {
//     'Range': 'bytes=0-20'
//   }
// };
// request(options).pipe(fs.createWriteStream('bla.iso'));


// ipc stuff

const ipc = require('electron').ipcMain;

ipc.on('signin', function(event, data){
    request({
        url: serverURL + "/apisignin",
        method: 'POST',
        form: data
    }, function(error, response, body) {
        if(!error){
            event.sender.send('signinRes', JSON.parse(body));
        }
    });
});

ipc.on('signup', function(event, data){
    request({
        url: serverURL + "/apisignup",
        method: 'POST',
        form: data
    }, function(error, response, body) {
        if(!error){
            event.sender.send('signupRes', JSON.parse(body));
        }
    });
});

ipc.on('download', function(event, task){
    // begin download here and send updates
    progress(request({
        url: task.url,
        headers: {
            "Range": "bytes=" + task.startByte + "-" + task.endByte
        }
    }, function() {
        event.sender.send('downloadFinish', task)
    }), {
        throttle: 100
    })
    .on('progress', function(state) {
        state.taskid = task.id;
        event.sender.send('downloadProgress', state);
    })
    .on('failure', function(err) {
        // this better not happen
    })
    .pipe(fs.createWriteStream(task.id));
});

// ipc.on('signin', function(event, data){
//     var result;
//     console.log(data.username);
//     console.log(data.password);
//     if(data.username == "test" && data.password == "test") {
//         result = {
//             type: "success",
//             username: "test",
//             balance: 0,
//             bytes: 0
//         }
//     }
//     else result = {
//         type: "error"
//     }
//     event.sender.send('signinRes', result);
// });

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform != 'darwin') {
        app.quit();
}
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {
    // Create the browser window.
    mainWindow = new BrowserWindow({width: 800, height: 600});

    // and load the index.html of the app.
    mainWindow.loadURL('file:///index.html');

    // Open the DevTools.
    // mainWindow.webContents.openDevTools();

    // Emitted when the window is closed.
    mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
        mainWindow = null;
    });
});

process.on('error', function(err) {
    console.log(err);
});
