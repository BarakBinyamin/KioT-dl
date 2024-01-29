const { app, BrowserWindow, ipcMain } = require('electron')
const path                            = require('node:path')
const findPort                        = require("find-free-port")

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

if (require('electron-squirrel-startup')){app.quit()} // Handle windows install

let VIEW_PORT       = 5173  
let API_PORT        = 2999
const defaultHeight = 700
const defaultWidth  = 800

async function main(){

  API_PORT = await new Promise((res,rej)=>findPort(3000, '127.0.0.1', (err, freePort)=>res(freePort)))

  const createWindow = () => {
    const mainWindow = new BrowserWindow({ 
      width: defaultWidth, height: defaultHeight,
      icon: path.join(__dirname,'electron/icons/icon.ico'),
      webPreferences: {
        preload: path.join(__dirname, 'electron/electron-api-back.js'),
      }
    })
    mainWindow.loadFile(`${__dirname}/app.html`)
    if (process.env.DEV === "true"){
      mainWindow.webContents.openDevTools()   
    }
  }

  app.whenReady().then(() => {
    // In dev mode, view is served @ 5173 and api is served seperate @ 3000
    VIEW_PORT = process.env.DEV === "true" ? VIEW_PORT : API_PORT
    ipcMain.handle('ping', () => VIEW_PORT)

    createWindow()
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0){
        createWindow()
      } 
    })
  })

  app.on('window-all-closed', () => {
    app.quit()
  })

  const server  = require(`${__dirname}/services/index.js`)
  server({
    dist    : `${__dirname}/view/dist`,
    port    :  API_PORT, 
    library : `${__dirname}/services/library`
  })
}

main()
