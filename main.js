const electron = require('electron');
const { app, BrowserWindow, Menu, ipcMain } = electron;
const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch')

const API_KEY = '4cd2c4b3edf638857f86df429992e48d';
const TEST_URL = 'https://api.themoviedb.org/3/movie/550?api_key=4cd2c4b3edf638857f86df429992e48d';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w185';


//getting resource from placeholderJSON:
fetch('https://jsonplaceholder.typicode.com/posts/1')
  .then((response) => response.json())
  .then((json) => console.log(json));



let mainWindow;
let addWindow;
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
  mainWindow.loadFile('MainWindow.html');

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

  //create menu from template
  const MainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  //insert menu
  Menu.setApplicationMenu(MainMenu);
}

//FUNCTON: create add window
function createAddWindow(){
  addWindow = new BrowserWindow({
    width: 300,
    height: 200,
    webPreferences: {
      nodeIntegration: true
    },
    title: 'Add movie to list'
  })
  
  addWindow.loadFile('AddWindow.html');

  //free mem on close
  addWindow.on('close', function(){
    addWindow = null;
  });
}

//Catch item add
ipcMain.on('item:add', function(event, item){
  dataList.push(item);
  mainWindow.webContents.send('item:add', item);
  addWindow.close();
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
        label: "Delete Movie",
        click(){
          dataList = [];
          mainWindow.webContents.send('item:clear');
        }
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