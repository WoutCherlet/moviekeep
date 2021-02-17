const electron = require('electron');
const {ipcRenderer} = electron;

const API_KEY = '4cd2c4b3edf638857f86df429992e48d';
const TEST_URL = 'https://api.themoviedb.org/3/movie/550?api_key=4cd2c4b3edf638857f86df429992e48d';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w185';
const BASE_URL = 'https://api.themoviedb.org/3/search/movie?api_key='
const OPTS = '&language=en-US&page=1&include_adult=false'
//catch item and send to main.js
const form = document.querySelector('form');
form.addEventListener('submit', submitform);

function submitform(event){
    event.preventDefault();
    const item = document.querySelector('#item').value;
    if(item.length == 0){
        console.log("no search term")
        return;
    }
    //build URL
    const URL = buildSearchURL(item);
    console.log(URL);
    //getting resource from themoviedb:
    fetch(URL)
      .then((response) => response.json())
      .then((json) => showTitles(json));
    //ipcRenderer.send('item:add', item);
}

function showTitles(json) {
    const cont = document.getElementsByClassName('maincontent')[0];
    results = json.results
    const ul = document.getElementById('results');
    ul.innerHTML = "";
    for (i=0; i<results.length; i++){
        const itemText = document.createTextNode(results[i].title + '\n');
        const li = document.createElement('li');
        li.appendChild(itemText);
        ul.appendChild(li);
    }
}

//build api url from searchterm
function buildSearchURL(searchterm){
    return BASE_URL + API_KEY + '&query=' + encodeURIComponent(searchterm) + OPTS;
}