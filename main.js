const electron = require('electron')
const { app, BrowserWindow, Menu, MenuItem } = electron
const path = require('path')

let mainWindow;
let addWindow;

//function to create main window
function createMainWindow () {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })

  //load in html file
  mainWindow.loadFile('MainWindow.html')

  //quit app when closed
  mainWindow.on('closed', function(){
    app.quit();
  })

  //create menu from template
  const MainMenu = Menu.buildFromTemplate(mainMenuTemplate)
  //insert menu
  Menu.setApplicationMenu(MainMenu)
}


//create main window when ready
app.whenReady().then(createMainWindow)


//Create AddWindow
function createAddWindow(){
  addWindow = new BrowserWindow({
    width: 300,
    height: 200,
    webPreferences: {
      nodeIntegration: true
    },
    title: 'Add movie to list'
  })

  addWindow.loadFile('AddWindow.html')

  //free mem on close
  addWindow.on('close', function(){
    addWindow = null;
  });
}

//main menu template
const mainMenuTemplate = [
  {
    label:'File',
    submenu: [
      {
        label: "Add Movie",
        click(){
          createAddWindow();
        }
      },
      {
        label: "Delete Movie"
        //TODO: on clock: delete movie window
      },
      {
        label: "Quit",
        accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
        click(){
          app.quit();
        }
      }
    ]
  }
];
//if mac: extra empty object
if(process.platform == 'darwin'){
  mainMenuTemplate.unshift({});
}
//add developer tools if not in prod
if(process.env.NODE_ENV !== 'production'){
  mainMenuTemplate.push({
    label: 'Developer Tools',
    submenu:[
      {
        label: 'Toggle Dev Tools',
        accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
        click(item, focusedWindow){
          focusedWindow.toggleDevTools();
        }
      },
      {
        role: 'reload'
      }
    ]
  });
}

//quit on close
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

//create window on activate
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow()
  }
})