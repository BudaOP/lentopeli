'use strict';
const player = prompt('Player name');
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
const sininenIkoni = L.divIcon({ className: 'sininen-ikoni' });
const vihreaIkoni = L.divIcon({ className: 'vihrea-ikoni' });
const harmaaIkoni = L.divIcon({ className: 'harmaa-ikoni' });

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
  document.querySelector('#selected-name').innerHTML = `Weather at ${name}`;
  document.querySelector('#selected-temp').innerHTML = `${weather.temp}°C`;
  document.querySelector('#selected-icon').src = weather.icon;
  document.querySelector(
    '#selected-wind'
  ).innerHTML = `${weather.wind.speed}m/s`;
  document.querySelector('#selected-weather').innerHTML = weather.description;
  if (weather.meets_goals.length > 0) {
    let splash = false;
    for (let goal of weather.meets_goals) {
      if (!goals.includes(goal)) {
        splash = true;
      }
    }
    if (splash) {
      document.querySelector('.leima').classList.toggle('hide');
      location.href = '#goals';
    }
  }
}

async function init(url = `newgame?player=${player}&loc=EFHK`) {
  airportMarkers.clearLayers();
  const gameData = await haeKentat(url);
  if (gameData.status.co2.budget <= 0) {
    alert('game over');
  }
  document.querySelector('#player').innerHTML = gameData.status.name;
  document.querySelector('#consumed').innerHTML = gameData.status.co2.consumed;
  document.querySelector('#budget').innerHTML = gameData.status.co2.budget;
  for (let kentta of gameData.location) {
    const marker = lisaaMarker(kentta);
    airportMarkers.addLayer(marker);
    if (kentta.active) {
      marker.setIcon(vihreaIkoni);
      currentAirport = kentta;
      map.flyTo([kentta.latitude, kentta.longitude], 10);
      marker.bindPopup(`Olet täällä: ${kentta.name}`).openPopup();
      console.log(document.querySelector('#selected-name'));
      naytaSaatiedot(kentta);
      kentta.start = false;
    } else {
      marker.setIcon(sininenIkoni);
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

document.querySelector('.leima').addEventListener('click', function () {
  this.classList.toggle('hide');
});

init();
