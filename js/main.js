'use strict';

// global variables

const airportUrl = 'http://127.0.0.1:3000/airportdata';
const playerUrl = 'http://127.0.0.1:3000/playerdata';
const apiUrl = 'http://127.0.0.1:3000/';

// icons

// form for player name

// function to fetch data from API
async function getData(apiUrl) {//url on perusarvo tiedon hakemiselle myöhemmin
  const response = await fetch(apiUrl);
  if (!response.ok) throw new Error("Wrong server input");
  const data = await response.json();
  return data;
}

// KESKEN
// function to update information status box
function updateGameInfo(info) {
  document.querySelector("#player-name").innerHTML = `Player: ${info.name}`;
  document.querySelector("#saved-toBeSaved").innerHTML = info.Patients.saved-Still_to_be_saved;
}

// KESKEN
// function to show info from the airport where you are at the moment
function uptadeAirportData(location) {
  document.querySelector("#location").innerHTML = `location at the monment ${location.name}`
}


// KESKEN
// function to show/update current range
function updateGameRange_airports(Range) {
  document.querySelector("#myRange").innerHTML = `My range: ${Range.name}`
}


// KESKEN
// function to show/update range and airports box
/*function updateDistances(distance) {
  document.querySelector("#distance")
}*/

// function to check if any goals have been reached

// function to update goal data and goal table in UI

// function to check if game is over

// function to set up game

//  function gameSetup(screenName) {
//     try {
//         const response = fetch(`${apiUrl}newgame?player=${screenName}`);
//         const gameData = response.json();
//     } catch (error) {
//         console.log(error)}
// };
//
// gameSetup(playerName);

// form for player name
document.querySelector('#player-form').addEventListener('submit', function (evt) {
  evt.preventDefault();
  const playerName = document.querySelector('#player-input').value;
  document.querySelector('#player-modal').classList.add('hide');
  gameSetup(`${apiUrl}newgame?player=${playerName}`);

  console.log(playerName);
});


/* LEAFLET */

/* Map setup */

const map = L.map('map', {
  tap: false,
  minZoom: 4, /* min and max zoom degree */
  maxZoom: 6
});

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

map.setView([63.419894, 10.385954], 4); /* default coordinates - home hospital */

map.setMaxBounds([ /* disables user from scrolling all over map */
    [59.408763, 5.279548],
    [69.683925, 18.984699]
]);

/* Function to create markers for map */

async function leafletSetup() {
  try {
    const gameData = await getData(airportUrl);
    console.log(gameData);

    for (let airport of gameData) {
      const marker = L.marker([airport.latitude_deg, airport.longitude_deg]).addTo(map);
      marker.bindPopup(`|`);
    }
  } catch (error) {
    console.log(error);
  }
}

// KESKEN
//Ottaa kiinni mahdollisesti virheelliset inputit API:in liittyen
// async function gameSetup(){
//   try {
//       const gameData = await getData(airportUrl);
//       console.log(gameData);
//       updateGameInfo(gameData.info);
//       updateGameRange_airports(gameData.range);
//       uptadeAirportData(gameData.location);
//   } catch (error) {
//     console.log(error);
//   }

  /* calls function to setup map */
  leafletSetup();


gameSetup();
// this is the main function that creates the game and calls the other functions

// event listener to hide goal splash
