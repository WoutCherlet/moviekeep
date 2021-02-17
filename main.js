const electron = require('electron');
const { app, BrowserWindow, Menu, ipcMain } = electron;
const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch')

let mainWindow;
let dataList = [];

//FUNCTION: create main window
function createMainWindow () {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })
  
  //read in data from file (format item1, item2, ..)
  try {
    const data = fs.readFileSync(path.resolve(__dirname, "data/data.txt")).toString();
    if (data != '' ){
      dataList = data.split(', ');
    }
  } catch (er) {
    console.log('error caught: ' + er);
  }

  //load in html file
  mainWindow.loadFile('CollectionTab.html');

  //add items from data to html file
  mainWindow.webContents.on('did-finish-load', ()=>{
    dataList.forEach(element => {
      mainWindow.webContents.send('item:add', element.toString());
    });
  })

  //quit app when closed
  mainWindow.on('closed', function(){
    app.quit();
  });
}

//Catch item add
ipcMain.on('item:add', function(event, item){
  dataList.push(item);
  mainWindow.webContents.send('item:add', item);
});

//Catch item remove
ipcMain.on('item:remove', function(event, item){
  const index = dataList.indexOf(item.toString());
  if (index > -1) {
    dataList.splice(index, 1);
  }else {
    console.log("ERROR: dataList doesn't include item, this shouldn't happen");
    console.log(item);
  }
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
  let out = ''
  dataList.forEach(element => {
      out = out.concat(element + ', ');
  });
  out = out.slice(0, -2);
  fs.writeFile(path.resolve(__dirname, "data/data.txt"), out,  (err) => { 
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