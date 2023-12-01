'use strict';
import { myClientId, myClientSecret, myPlaylistId } from './config.js';

//-----------------------------------Elemement Selector-----------------------------//

const searchBar = document.querySelector('.search-bar');
const searchResults = document.querySelector('.search-result');
const elementPlaylist = document.querySelector('.playlist');

//--------------------------API Calls Functions----------------------------------//
const clientId = myClientId;
const clientSecret = myClientSecret;
const playlistId = myPlaylistId;
let token;

// To get token (token expires in 1hr)
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
    token = data.access_token;
    console.log(token);
    return token;
  } catch (error) {
    console.error('Fetch error', error);
  }
};

async function initializeApp() {
  await getToken();
  await getPlaylist();
}

// Initialize app on window load
window.addEventListener('load', initializeApp);
searchBar.addEventListener('keyup', searchOnEnter); // Capturing 'Enter' on search bar

// To get artist and tracks data from Spotify
const searchItem = async (searchInput) => {
  try {
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${searchInput}&type=artist%2Ctrack&limit=5`,
      {
        method: 'GET',
        headers: { Authorization: 'Bearer ' + token },
      }
    );
    const data = await response.json();
    displaySearchResult(data);
  } catch (error) {
    console.error('Fetch error', error);
  }
};

// To get a playlist from Spotify
const getPlaylist = async () => {
  try {
    const response = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}`,
      {
        method: 'GET',
        headers: { Authorization: 'Bearer ' + token },
      }
    );
    const data = await response.json();
    displayPlaylist(data);
    console.log(data);
  } catch (error) {
    console.error('Fetch error', error);
  }
};

// To add a song to playlist
const addToPlaylist = async (trackId) => {
  try {
    const response = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
      {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + token },
        data: {
          uris: ['spotify:track:' + trackId],
          position: 0,
        },
      }
    );
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error('Fetch error', error);
  }
};

//-----------UI Functions---------------//

function searchOnEnter(e) {
  e.preventDefault();
  if (e.key === 'Enter') {
    const searchInput = searchBar.value;
    clearSearchResults();
    searchItem(searchInput);
  }
}

function displayPlaylist(playlist) {
  // Create container for playlist
  const playlistContainer = document.createElement('div');
  playlistContainer.classList.add('playlist-container');

  // Create h2 element for playlist title
  const playlistTitle = document.createElement('h2');
  playlistTitle.textContent = playlist.name;

  const tracks = playlist.tracks.items;
  console.log(tracks);

  // Create container for all tracks
  const tracksContainer = document.createElement('div');
  tracksContainer.classList.add('tracks-container');

  // Create a container for each track
  const tracksList = document.createElement('div');
  tracksList.classList.add('tracks-list');

  // Create a container for each track item
  tracks.forEach((track) => {
    const trackItem = document.createElement('div');
    trackItem.classList.add('track-item-playlist');

    // Check if track has images and the image array is not empty
    if (track.track.album.images && track.track.album.images.length > 0) {
      const trackImage = document.createElement('img');
      trackImage.src = track.track.album.images[0].url;
      trackItem.appendChild(trackImage);
    }

    const trackDetails = document.createElement('div');
    trackDetails.classList.add('track-details');

    //Create a paragraph for track's name
    const trackName = document.createElement('p');
    trackName.textContent = track.track.name;
    console.log(track.track.name);
    trackDetails.appendChild(trackName);

    //Create a paragraph for tracks's artist name
    const artistName = document.createElement('p');
    artistName.classList.add('track-artist');
    artistName.textContent = track.track.artists[0].name;
    console.log(track.track.artists[0].name);
    trackDetails.appendChild(artistName);

    trackItem.appendChild(trackDetails);
    tracksList.appendChild(trackItem);
  });

  tracksContainer.appendChild(tracksList);
  playlistContainer.appendChild(playlistTitle);
  playlistContainer.appendChild(tracksContainer);
  elementPlaylist.appendChild(playlistContainer);
}

function displaySearchResult(data) {
  if (data.artists.items.length > 0) {
    displayArtists(data.artists.items);
  }

  if (data.tracks.items.length > 0) {
    displayTracks(data.tracks.items);
  }
  searchResults.style.opacity = 1;
}

// Remove all child nodes from the search result container
function clearSearchResults() {
  while (searchResults.firstChild) {
    searchResults.removeChild(searchResults.firstChild);
  }
}

function displayArtists(artists) {
  console.log(artists);
  // Create HTML elements for artists
  const artistsContainer = document.createElement('div');
  artistsContainer.classList.add('artists-container');

  const artistsTitle = document.createElement('h2');
  artistsTitle.textContent = 'Artists';

  // Create a container for each artist
  const artistsList = document.createElement('div');
  artistsList.classList.add('artists-list');

  // Create a container for each artist item
  artists.forEach((artist) => {
    const artistItem = document.createElement('div');
    artistItem.classList.add('artist-item');

    // Check if artist has images and the image array is not empty
    if (artist.images && artist.images.length > 0) {
      const artistImage = document.createElement('img');
      artistImage.src = artist.images[0].url;
      artistItem.appendChild(artistImage);
    }

    //Create a paragraph for artist's name
    const artistName = document.createElement('p');
    artistName.textContent = artist.name;
    artistItem.appendChild(artistName);

    // Store artist ID as a custom data attribute with 'dataset'
    artistItem.dataset.artistId = artist.id;

    artistsList.appendChild(artistItem);
  });

  artistsContainer.appendChild(artistsTitle);
  artistsContainer.appendChild(artistsList);
  searchResults.appendChild(artistsContainer);

  // Artist selector
  const elementArtistItem = document.querySelectorAll('.artist-item');

  // Event listeners for artists
  elementArtistItem.forEach(function (artist) {
    artist.addEventListener('click', onArtistClick);
  });

  // When user click on a track
  function onArtistClick(e) {
    e.preventDefault();
    const selectedArtist = e.target.closest('.artist-item');
    const artistId = selectedArtist.dataset.artistId;
    console.log('Selected Artist:', selectedArtist);
    console.log('Artist ID:', artistId);
  }
}

// Create HTML elements for tracks
function displayTracks(tracks) {
  const tracksContainer = document.createElement('div');
  tracksContainer.classList.add('tracks-container');

  const tracksTitle = document.createElement('h2');
  tracksTitle.textContent = 'Songs';

  // Create a container for each track
  const tracksList = document.createElement('div');
  tracksList.classList.add('tracks-list');

  // Create a container for each track item
  tracks.forEach((track) => {
    const trackItem = document.createElement('div');
    trackItem.classList.add('track-item');

    // Check if track has images and the image array is not empty
    if (track.album.images && track.album.images.length > 0) {
      const trackImage = document.createElement('img');
      trackImage.src = track.album.images[0].url;
      trackItem.appendChild(trackImage);
    }

    const trackDetails = document.createElement('div');
    trackDetails.classList.add('track-details');

    //Create a paragraph for track's name
    const trackName = document.createElement('p');
    trackName.textContent = track.name;
    trackDetails.appendChild(trackName);

    //Create a paragraph for tracks's artist name
    const artistName = document.createElement('p');
    artistName.classList.add('track-artist');
    artistName.textContent = track.artists[0].name;
    trackDetails.appendChild(artistName);

    // Store track ID as a custom data attribute with 'dataset'
    trackItem.dataset.trackId = track.id;
    console.log(track.id);

    trackItem.appendChild(trackDetails);
    tracksList.appendChild(trackItem);
  });

  tracksContainer.appendChild(tracksTitle);
  tracksContainer.appendChild(tracksList);
  searchResults.appendChild(tracksContainer);

  // Track selector
  const elementTrackItem = document.querySelectorAll('.track-item');

  // Event listener to capture selected track on click
  elementTrackItem.forEach(function (track) {
    track.addEventListener('click', onTrackClick);
  });

  // When user click on a track
  function onTrackClick(e) {
    e.preventDefault();
    console.log(e.target);
    const selectedTrack = e.target;
    const trackId = selectedTrack.dataset.trackId;
    console.log('Selected Track:', selectedTrack);
    console.log('Track ID:', trackId);
    addToPlaylist(trackId);
  }
}
