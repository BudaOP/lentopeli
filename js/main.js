'use strict';
let playerName = 'no name';
const playerForm = document.getElementById('player-form');
playerForm.addEventListener('submit', function (evt) {
  evt.preventDefault();
  playerName = document.getElementById('player-input').value;
  document.getElementById('player-modal').classList.add('hide');
  init();
});

// Käytetään leaflet.js -kirjastoa näyttämään sijainti kartalla (https://leafletjs.com/)
const map = L.map('map', { tap: false });
L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
  maxZoom: 20,
  subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
}).addTo(map);
map.setView([60, 24], 7);

let currentAirport = {};
let airportMarkers = L.featureGroup().addTo(map);
const goals = [];

// ikonit
const blueIcon = L.divIcon({ className: 'blue-icon' });
const greenIcon = L.divIcon({ className: 'green-icon' });
const greyIcon = L.divIcon({ className: 'grey-icon' });

async function haeKentat(url) {
  const vastaus = await fetch('http://127.0.0.1:5000/' + url);
  const gameData = await vastaus.json();
  return gameData;
}

function lisaaMarker(kentta) {
  return L.marker([kentta.latitude, kentta.longitude]).addTo(map);
}

function naytaSaatiedot(kentta) {
  const { name, weather } = kentta;
  document.querySelector('#airport-name').innerHTML = `Weather at ${name}`;
  document.querySelector('#airport-temp').innerHTML = `${weather.temp}°C`;
  document.querySelector('#weather-icon').src = weather.icon;
  document.querySelector(
    '#airport-wind'
  ).innerHTML = `${weather.wind.speed}m/s`;
  document.querySelector('#airport-conditions').innerHTML = weather.description;
  if (weather.meets_goals.length > 0) {
    let splash = false;
    for (let goal of weather.meets_goals) {
      if (!goals.includes(goal)) {
        splash = true;
      }
    }
    if (splash) {
      document.querySelector('.goal').classList.toggle('hide');
      location.href = '#goals';
    }
  }
}

async function init(url = `newgame?player=${playerName}&loc=EFHK`) {
  airportMarkers.clearLayers();
  const gameData = await haeKentat(url);
  if (gameData.status.co2.budget <= 0) {
    alert('game over');
    return;
  }
  document.querySelector(
    '#player-name'
  ).innerHTML = `Player: ${gameData.status.name}`;
  document.querySelector('#consumed').innerHTML = gameData.status.co2.consumed;
  document.querySelector('#budget').innerHTML = gameData.status.co2.budget;
  for (let kentta of gameData.location) {
    const marker = lisaaMarker(kentta);
    airportMarkers.addLayer(marker);
    if (kentta.active) {
      marker.setIcon(greenIcon);
      currentAirport = kentta;
      map.flyTo([kentta.latitude, kentta.longitude], 10);
      marker.bindPopup(`You are here: ${kentta.name}`).openPopup();
      console.log(document.querySelector('#airport-name'));
      naytaSaatiedot(kentta);
      kentta.start = false;
    } else {
      marker.setIcon(blueIcon);
      const popupContent = document.createElement('div');
      const h4 = document.createElement('h4');
      h4.innerHTML = kentta.name;
      popupContent.appendChild(h4);
      const goNappi = L.DomUtil.create('button', 'nappi');
      goNappi.innerHTML = 'Fly here';
      goNappi.addEventListener('click', async function () {
        const url = `flyto?game=${gameData.status.id}&dest=${kentta.ident}&consumption=${kentta.co2_consumption}`;
        init(url);
      });
      popupContent.appendChild(goNappi);
      marker.bindPopup(popupContent);
      marker.on('click', function () {
        console.log('täh');
        const p = document.createElement('p');
        p.innerHTML = `Distance: ${kentta.distance}km`;
        popupContent.appendChild(p);
        marker.openPopup();
      });
    }
  }
  document.querySelector('#goals').innerHTML = '';
  for (let goal of gameData.goals) {
    const li = document.createElement('li');
    if (goal.reached) {
      li.classList.add('done');
      goals.push(goal.goalid);
    }
    const figure = document.createElement('figure');
    const img = document.createElement('img');
    img.src = goal.icon;
    img.alt = `goal name: ${goal.name}`;
    const figcaption = document.createElement('figcaption');
    figcaption.innerHTML = goal.description;
    figure.appendChild(img);
    figure.appendChild(figcaption);
    li.appendChild(figure);
    document.querySelector('#goals').append(li);
  }
  map.invalidateSize(true);
}

document.querySelector('.goal').addEventListener('click', function () {
  this.classList.toggle('hide');
});
