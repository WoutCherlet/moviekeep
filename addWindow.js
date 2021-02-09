const electron = require('electron');
const {ipcRenderer} = electron;

//catch item and send to main.js
const form = document.querySelector('form');
form.addEventListener('submit', submitform);

function submitform(event){
    event.preventDefault();
    const item = document.querySelector('#item').value;
    ipcRenderer.send('item:add', item);
}