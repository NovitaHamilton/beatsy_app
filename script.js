'use strict';
import { myClientId, myClientSecret } from './config.js';

const clientId = myClientId;
const clientSecret = myClientSecret;

// Function to get token (token expires in 1hr)
const getToken = async () => {
  try {
    const response = await fetch(`https://accounts.spotify.com/api/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`,
    });
    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Fetch error', error);
  }
};

// Function for the search bar
const searchItem = async (searchInput) => {
  try {
    const token = await getToken();
    console.log(token);
    console.log(searchInput);
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${searchInput}&type=artist%2Ctrack&limit=5`,
      {
        method: 'GET',
        headers: { Authorization: 'Bearer ' + token },
      }
    );
    const data = await response.json();
    console.log(data);
    displaySearchResult(data);
  } catch (error) {
    console.error('Fetch error', error);
  }
};

//-----------------------------------Elemement Selector-----------------------------//

const elementSearchBar = document.querySelector('.search-bar');
const elementSearchResult = document.querySelector('.search-result');

//------------------------------------Event Listener------------------------------//

elementSearchBar.addEventListener('keyup', searchOnEnter); // Capturing 'Enter' on search bar

//-----------Functions---------------//

function searchOnEnter(e) {
  e.preventDefault();
  console.log(e.key);
  if (e.key === 'Enter') {
    const searchInput = elementSearchBar.value;
    clearSearchResults();
    searchItem(searchInput);
  }
}

function displaySearchResult(data) {
  if (data.artists.items.length > 0) {
    displayArtists(data.artists.items);
  }

  if (data.tracks.items.length > 0) {
    displayTracks(data.tracks.items);
  }
  elementSearchResult.style.opacity = 1;
}

function clearSearchResults() {
  // Remove all child nodes from the search result container
  while (elementSearchResult.firstChild) {
    elementSearchResult.removeChild(elementSearchResult.firstChild);
  }
}

function displayArtists(artists) {
  console.log('Artists:', artists);

  // Create HTML elements for artists
  const artistsContainer = document.createElement('div');
  artistsContainer.classList.add('artists-container');

  const artistsTitle = document.createElement('h2');
  artistsTitle.textContent = 'Artists';

  // Create a container for each artist
  const artistsList = document.createElement('div');
  artistsList.classList.add('artists-list');

  artists.forEach((artist) => {
    // Create a container for each artist item
    const artistItem = document.createElement('div');
    artistItem.classList.add('artist-item');

    // Check if artist has images and the image array is not empty
    if (artist.images && artist.images.length > 0) {
      const artistImage = document.createElement('img');
      artistImage.src = artist.images[0].url;
      console.log(artist.images[0].url);
      artistItem.appendChild(artistImage);
    }

    //Create a paragraph for artist's name
    const artistName = document.createElement('p');
    artistName.textContent = artist.name;
    artistItem.appendChild(artistName);

    artistsList.appendChild(artistItem);
  });

  artistsContainer.appendChild(artistsTitle);
  artistsContainer.appendChild(artistsList);
  elementSearchResult.appendChild(artistsContainer);
}

function displayTracks(tracks) {
  console.log('Tracks:', tracks);
  // Create HTML elements for artists
  const tracksContainer = document.createElement('div');
  tracksContainer.classList.add('tracks-container');

  const tracksTitle = document.createElement('h2');
  tracksTitle.textContent = 'Songs';

  // Create a container for each artist
  const tracksList = document.createElement('div');
  tracksList.classList.add('tracks-list');

  tracks.forEach((track) => {
    // Create a container for each artist item
    const trackItem = document.createElement('div');
    trackItem.classList.add('track-item');

    // Check if artist has images and the image array is not empty
    if (track.album.images && track.album.images.length > 0) {
      const trackImage = document.createElement('img');
      trackImage.src = track.album.images[0].url;
      console.log(track.album.images[0].url);
      trackItem.appendChild(trackImage);
    }

    const trackDetails = document.createElement('div');
    trackDetails.classList.add('track-details');

    //Create a paragraph for track's name
    const trackName = document.createElement('p');
    trackName.textContent = track.name;
    trackDetails.appendChild(trackName);

    //Create a paragraph for artis's name
    const artistName = document.createElement('p');
    artistName.classList.add('track-artist');
    artistName.textContent = track.artists[0].name;
    trackDetails.appendChild(artistName);

    trackItem.appendChild(trackDetails);
    tracksList.appendChild(trackItem);
  });

  tracksContainer.appendChild(tracksTitle);
  tracksContainer.appendChild(tracksList);
  elementSearchResult.appendChild(tracksContainer);
}
