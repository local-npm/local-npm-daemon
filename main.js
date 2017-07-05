const { app, BrowserWindow, ipcMain, Tray } = require('electron');

require('electron-debug')({enabled: true, showDevTools: true});
require('./log')('local-npm-daemon');

const path = require('path')
const spawn = require('child_process').spawn;
const npm = require('local-npm');

const assetsDir = path.join(__dirname, 'assets');
const tempDir = path.join(__dirname, 'temp');

const server = npm({
    directory: tempDir,
    port: 5678,
    pouchPort: 3040,
    logLevel: 'debug',
    remote: 'https://registry.npmjs.org',
    remoteSkim: 'https://replicate.npmjs.com',
    url: 'http://127.0.0.1:5080'
}, () => {
    console.log('listening!');
});

let tray = undefined
let window = undefined

// This method is called once Electron is ready to run our code
// It is effectively the main method of our Electron app
app.on('ready', () => {
  // Setup the menubar with an icon
  tray = new Tray(path.resolve(__dirname, './assets/cloudTemplate.png'));

  // Add a click handler so that when the user clicks on the menubar icon, it shows
  // our popup window
  tray.on('click', function(event) {
    toggleWindow()

    // Show devtools when command clicked
    if (window.isVisible() && process.defaultApp && event.metaKey) {
      window.openDevTools({mode: 'detach'})
    }
  })

  // Make the popup window for the menubar
  window = new BrowserWindow({
    width: 500,
    height: 350,
    show: false,
    frame: false,
    resizable: false,
  })

  // Only close the window on blur if dev tools isn't opened
  window.on('blur', () => {
    if(!window.webContents.isDevToolsOpened()) {
      window.hide()
    }
  })
})

const toggleWindow = () => {
  if (window.isVisible()) {
    window.hide()
  } else {
    showWindow()
  }
}

const showWindow = () => {
  window.loadURL(`http://127.0.0.1:5678/_browse`);

  const trayPos = tray.getBounds()
  const windowPos = window.getBounds()
  let x, y = 0
  if (process.platform == 'darwin') {
    x = Math.round(trayPos.x + (trayPos.width / 2) - (windowPos.width / 2))
    y = Math.round(trayPos.y + trayPos.height)
  } else {
    x = Math.round(trayPos.x + (trayPos.width / 2) - (windowPos.width / 2))
    y = Math.round(trayPos.y + trayPos.height * 10)
  }


  window.setPosition(x, y, false)
  window.show()
  window.focus()
}

ipcMain.on('show-window', () => {
  showWindow()
})

app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    server.close();
    app.quit()
  }
})
