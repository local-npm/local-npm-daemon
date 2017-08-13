const { app, BrowserWindow, ipcMain, Tray, Menu, MenuItem, shell } = require('electron');

const path = require('path')
const local = require('local-npm');
const os = require('os');

const assetsDir = path.resolve(__dirname, 'assets');

const server = local({
    directory: path.resolve(os.homedir(), '.local-npm'),
    port: 5678,
    pouchPort: 3040,
    logLevel: 'error',
    remote: 'https://registry.npmjs.org',
    remoteSkim: 'https://replicate.npmjs.com',
    url: 'http://127.0.0.1:5080',
    syncInterval: 60000
}, () => {
    console.log('listening!');
});

let tray;

app.on('ready', () => {
  tray = new Tray(path.resolve(assetsDir, 'cloudTemplate.png'));

  var requests = 0;
  var sync = 0;
  function getMenu() {
    return Menu.buildFromTemplate([
      {label: 'http://localhost:5678', click: function() { shell.openExternal('http://localhost:5678/_browse') } },
      {label: `requests: ${requests}`, type: 'normal'},
      {label: `sync: ${sync}`, type: 'normal'}
    ]);
  }

  process.on('request', (args) => {
    ++requests;
  })

  process.on('sync', (args) => {
    sync = args[1];
  })

  tray.on('click', function() {
      tray.popUpContextMenu(getMenu())
  })
});
