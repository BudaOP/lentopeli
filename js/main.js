'use strict';
(async function () {
  // Käytetään leaflet.js -kirjastoa näyttämään sijainti kartalla (https://leafletjs.com/)
  const map = L.map('map');
  L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
  }).addTo(map);
  map.setView([60, 24], 7);

  // ikonit
  const sininenIkoni = L.divIcon({ className: 'sininen-ikoni' });
  const vihreaIkoni = L.divIcon({ className: 'vihrea-ikoni' });
  const harmaaIkoni = L.divIcon({ className: 'harmaa-ikoni' });

  async function haeKentat() {
    const vastaus = await fetch('airports.json');
    const gameData = await vastaus.json();
    return gameData;
  }

  function lisaaMarker(kentta) {
    return L.marker([kentta.latitude, kentta.longitude]).addTo(map);
  }

  async function haeSaatiedot(id) {
    const vastaus = await fetch('weather.json');
    const tiedot = await vastaus.json();
    return tiedot;
  }

  function naytaSaatiedot(kentta, weather = kentta.weather) {
    console.log(kentta);
    document.querySelector('#selected-name').innerHTML = name;
    document.querySelector('#selected-temp').innerHTML = `${weather.temp}°C`;
    document.querySelector('#selected-icon').src = weather.icon;
    document.querySelector('#selected-weather').innerHTML = weather.description;
  }

  let currentAirport = {};
  let airportMarkers = {};

  const gameData = await haeKentat();

  async function init() {
    for (let kentta of gameData.location) {
      const marker = lisaaMarker(kentta);
      switch (kentta.status) {
        case 0:
          marker.setIcon(sininenIkoni);
          break;
        case 1:
          marker.setIcon(vihreaIkoni);
          break;
        case 2:
          marker.setIcon(harmaaIkoni);
          break;
      }
      airportMarkers[kentta.ident] = marker;
      if (kentta.status === 1) {
        currentAirport = kentta;
        document.querySelector('#selected-name').innerHTML =
          'Start: ' + kentta.name;
        map.flyTo([kentta.latitude, kentta.longitude], 12);
        marker.bindPopup(`Olet täällä: ${kentta.name}`).openPopup();
        // console.log(kentta);
        naytaSaatiedot(kentta);
        kentta.start = false;
      } else {
        const popupContent = document.createElement('div');
        const h4 = document.createElement('h4');
        h4.innerHTML = kentta.name;
        popupContent.appendChild(h4);
        if (kentta.status !== 2) {
          const goNappi = L.DomUtil.create('button', 'nappi');
          goNappi.innerHTML = 'Lennä tänne';
          goNappi.addEventListener('click', async function () {
            naytaSaatiedot(kentta);
            currentAirport.status = 2;
            currentAirport = kentta.ident;
            kentta.status = 1;
            init();
          });

          popupContent.appendChild(goNappi);
        }
        marker.bindPopup(popupContent);
        marker.on('click', function () {
          const etaisyys = distance(
            [currentAirport.latitude, currentAirport.longitude],
            [kentta.latitude, kentta.longitude]
          );
          const p = document.createElement('p');
          p.innerHTML = `Etäisyys: ${etaisyys}km`;
          popupContent.appendChild(p);
          const dummyWeather = {
            temp: '?',
            description: '?',
            icon: 'https://placekitten.com/50/50',
            wind: {
              speed: '?',
              deg: '?',
            },
          };
          naytaSaatiedot(kentta, dummyWeather);
        });
      }
    }
    // console.log(airportMarkers, currentAirport);
    const goalImgs = {};
    document.querySelector('#goals').innerHTML = '';
    for (let goal of gameData.goals) {
      const li = document.createElement('li');
      const figure = document.createElement('figure');
      const img = document.createElement('img');
      img.src = goal.icon;
      img.alt = `goal name: ${goal.name}`;
      goalImgs[goal.name] = img;
      const figcaption = document.createElement('figcaption');
      figcaption.innerHTML = goal.description;
      figure.appendChild(img);
      figure.appendChild(figcaption);
      li.appendChild(figure);
      document.querySelector('#goals').append(li);
    }
  }

  init();

  function distance(loc1, loc2) {
    console.log(loc1, loc2);
    const rad_per_deg = Math.PI / 180;
    const rkm = 6371;

    const dlat_rad = (loc2[0] - loc1[0]) * rad_per_deg;
    const dlon_rad = (loc2[1] - loc1[1]) * rad_per_deg;

    const latlon1 = loc1.map(function (i) {
      return i * rad_per_deg;
    });
    const latlon2 = loc2.map(function (i) {
      return i * rad_per_deg;
    });

    const a =
      Math.sin(dlat_rad / 2) ** 2 +
      Math.cos(latlon1[0]) * Math.cos(latlon2[0]) * Math.sin(dlon_rad / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(rkm * c);
  }
})();
