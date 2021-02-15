const electron = require('electron');
const {ipcRenderer} = electron;
const ul = document.getElementById('items');


//catch add
ipcRenderer.on('item:add', function(event, item){
    const li = document.createElement('li');
    const itemText = document.createTextNode(item);
    li.appendChild(itemText);
    let button = document.createElement('button');
    button.textContent = 'delete';
    button.className = 'deleteItem';
    button.addEventListener('click', removeItem);
    li.appendChild(button);
    ul.appendChild(li);
})


//removeitem
function removeItem(event){
    //get listItem
    const item = event.target.parentNode;
    //send to main to update data, send text
    ipcRenderer.send('item:remove', item.childNodes[0].textContent);
    //remove from display
    const list = item.parentNode;
    list.removeChild(item);
}
