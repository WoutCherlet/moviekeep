const electron = require('electron');
const {ipcRenderer} = electron;
const ul = document.getElementById('items');


//catch add
ipcRenderer.on('item:add', function(event, movieObj){
    const li = document.createElement('li');
    li.movie = movieObj;
    const itemText = document.createTextNode(movieObj.title);
    li.appendChild(itemText);
    let button = document.createElement('button');
    button.textContent = 'X';
    button.className = 'deleteItem';
    button.addEventListener('click', removeItem);
    li.appendChild(button);
    ul.appendChild(li);
})


//removeitem
function removeItem(event){
    //get listItem
    const li = event.target.parentNode;
    const id = li.movie.id;
    //send to main to update data, send id of movie to delete
    ipcRenderer.send('item:remove', id);
    //remove from display
    const list = li.parentNode;
    list.removeChild(li);
}
