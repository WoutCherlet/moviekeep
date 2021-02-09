const electron = require('electron');
const {ipcRenderer} = electron;
const ul = document.querySelector('ul');


//catch add
ipcRenderer.on('item:add', function(event, item){
    console.log('item being added');
    const li = document.createElement('li');
    const itemText = document.createTextNode(item);
    li.appendChild(itemText);
    ul.appendChild(li);
})

//clear items
ipcRenderer.on('item:clear', function(){
    ul.innerHTML = '';
})
