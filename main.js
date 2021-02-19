const electron = require('electron');
const { app, BrowserWindow, Menu, ipcMain } = electron;
const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch')

let mainWindow;
//dataListJSON is object, form {id: JSONS, id: JSON, ...}
let dataObject = {};

//FUNCTION: create main window
function createMainWindow () {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })
  try{
    if (fs.existsSync(path.resolve(__dirname, "data/collectionTEST.json"))){
      //read in from json
      dataObject = JSON.parse(fs.readFileSync(path.resolve(__dirname, "data/collectionTEST.json")));
      if(dataObject == ''){
        dataObject = {};
      }
    }
  } catch(er){
    console.log('error in reading json' + er);
  }

  //load in html file
  mainWindow.loadFile('CollectionTab.html');

  //add items from data to html file
  mainWindow.webContents.on('did-finish-load', ()=>{
    for (const property in dataObject){
      mainWindow.webContents.send('item:add', dataObject[property]);
    }
  })

  //quit app when closed
  mainWindow.on('closed', function(){
    app.quit();
  });
}

//Catch item add
ipcMain.on('item:add', function(event, movieObj){
  const id = movieObj.id;
  dataObject[id.toString()] = movieObj;
  mainWindow.webContents.send('item:add', movieObj);
});

//Catch item remove
ipcMain.on('item:remove', function(event, id){
  delete dataObject[id.toString()];
})

//add developer tools if not in prod, otherwise remove menu
if(process.env.NODE_ENV !== 'production'){
  mainMenuTemplate = [{
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
  }];
  //create menu from template
  const MainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  //insert menu
  Menu.setApplicationMenu(MainMenu);
} else {  
  mainWindow.setMenu(null)
}

//create main window when ready
app.whenReady().then(createMainWindow);


//save before quitting
app.on('before-quit', () => {
  //write to JSON
  fs.writeFile(path.resolve(__dirname, "data/collectionTEST.json"), JSON.stringify(dataObject), (err) => { 
    if (err) throw err; 
  });
});

//quit on close
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

//create window on activate
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});