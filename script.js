'use strict';

//-----------------------------------Elemement Selector-----------------------------//
const searchBar = document.querySelector('.search-bar');
const searchResults = document.querySelector('.search-result');
const elementPlaylist = document.querySelector('.playlist');

// Initialize app on window load
window.addEventListener('load', initializeApp);

//--------------------------API Calls----------------------------------//
const clientId = 'b11afd8d1d42432ab734f20b8f5e1898';
const clientSecret = 'cd1183df69e84d9ba6f26b492f792233';
let token;
const mockAPIUrl = 'https://654d199b77200d6ba859fcf7.mockapi.io/tracks';

// To get token from Spotify (token expires in 1hr) (POST)
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
    return token;
  } catch (error) {
    console.error('Fetch error', error);
  }
};

// To get artist and tracks data from Spotify (GET)
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

// To get playlist data from mockAPI (GET)
const getPlaylist = async () => {
  try {
    const response = await fetch(`${mockAPIUrl}`);
    const data = await response.json();
    displayPlaylist(data);
    console.log(data);
  } catch (error) {
    console.error('Fetch error', error);
  }
};

// To post a track to My Playlist in mockAPI (POST)
const addToPlaylist = async (trackInfo) => {
  try {
    // To add the track to playlist
    const addResponse = await fetch(`${mockAPIUrl}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: trackInfo.id,
        name: trackInfo.name,
        artist: trackInfo.artist,
        image: trackInfo.image,
      }),
    });
    const addData = await addResponse.json();
    console.log('Added data', addData);

    // To get the updated playlist
    const playlistResponse = await fetch(`${mockAPIUrl}`);
    const playlistData = await playlistResponse.json();

    // Display the updated playlist
    displayPlaylist(playlistData);

    return addData;
  } catch (error) {
    console.error('Fetch error', error);
  }
};

// To remove a track from playlist in mockAPI (DELETE)
const removeFromPlaylist = async (trackId) => {
  try {
    const response = await fetch(`${mockAPIUrl}/${trackId}`, {
      method: 'DELETE',
    });

    // To get the updated playlist
    const playlistResponse = await fetch(`${mockAPIUrl}`);
    const playlistData = await playlistResponse.json();

    // Display the updated playlist
    displayPlaylist(playlistData);
    return playlistData;
  } catch (error) {
    console.error('Fetch error', error);
  }
};

// To get artist's top tracks
const getArtistTopTracks = async (artistId) => {
  console.log(token);
  try {
    const response = await fetch(
      `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=CA`,
      {
        method: 'GET',
        headers: { Authorization: 'Bearer ' + token },
      }
    );
    const topTracks = await response.json();
    console.log(topTracks);

    const artistDetails = await getArtistDetails(artistId);
    console.log(artistDetails);

    displayArtistTopTracks(topTracks, artistDetails);
    return topTracks, artistDetails;
  } catch (error) {
    console.error('Fetch error', error);
  }
};

const getArtistDetails = async (artistId) => {
  try {
    const response = await fetch(
      `https://api.spotify.com/v1/artists/${artistId}`,
      {
        method: 'GET',
        headers: { Authorization: 'Bearer ' + token },
      }
    );
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error('Fetch error', error);
  }
};

//-------------------------------UI Functions-----------------------------//

// To initialize application
async function initializeApp() {
  await getToken();
  await getPlaylist();

  searchBar.addEventListener('keyup', searchOnEnter); // Capturing 'Enter' on search bar
}

function searchOnEnter(e) {
  e.preventDefault();
  if (e.key === 'Enter') {
    const searchInput = searchBar.value;
    clearSearchResults();
    searchItem(searchInput);
  }
}

function displayPlaylist(playlist) {
  // Clear the existing content in playlist
  elementPlaylist.innerHTML = '';

  // Create container for playlist
  const playlistContainer = document.createElement('div');
  playlistContainer.classList.add('playlist-container');

  // Create h2 element for playlist title
  const playlistTitle = document.createElement('h2');
  playlistTitle.textContent = 'My Playlist';

  // Create container for all tracks
  const tracksContainer = document.createElement('div');
  tracksContainer.classList.add('tracks-container');

  // Create a container for each track
  const tracksList = document.createElement('div');
  tracksList.classList.add('tracks-list');

  // Create a container for each track item
  playlist.forEach((track) => {
    const trackItem = document.createElement('div');
    trackItem.classList.add('track-item-playlist');

    // Check if track has image
    if (track.image) {
      const trackImage = document.createElement('img');
      trackImage.src = track.image;
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
    artistName.textContent = track.artist;
    trackDetails.appendChild(artistName);

    // Store track ID as a custom data attribute with 'dataset'
    trackItem.dataset.trackId = track.id;
    console.log(track.id);

    // Add button to remove track to playlist
    const deleteButton = document.createElement('button');
    deleteButton.classList.add('remove-from-playlist');

    // Add plus icon inside the button
    const deleteIcon = document.createElement('i');
    deleteIcon.classList.add('fas', 'fa-x');
    deleteButton.appendChild(deleteIcon);

    // Set title for button tooltip
    deleteButton.title = 'Remove from Playlist';

    trackItem.appendChild(trackDetails);
    trackItem.appendChild(deleteButton);
    tracksList.appendChild(trackItem);
  });

  tracksContainer.appendChild(tracksList);
  playlistContainer.appendChild(playlistTitle);
  playlistContainer.appendChild(tracksContainer);
  elementPlaylist.appendChild(playlistContainer);

  // Track selector
  const elementTrackItem = document.querySelectorAll('.track-item-playlist');

  // Event listener to capture selected track on click
  elementTrackItem.forEach(function (track) {
    track.addEventListener('click', onRemoveClick);
  });

  // When user click on remove a track
  function onRemoveClick(e) {
    e.preventDefault();
    console.log(e.target);
    const selectedTrack = e.target.closest('.track-item-playlist');
    const trackId = selectedTrack.dataset.trackId;

    console.log('Selected Track:', selectedTrack);
    console.log('Track ID:', trackId);
    removeFromPlaylist(trackId);
  }
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
      const imageDetails = artist.images[0];

      //Set the image attribute
      artistImage.src = imageDetails.url;

      //Set the height and width attributes
      // artistImage.height = imageDetails.height;
      // artistImage.width = imageDetails.width;
      // console.log('height', imageDetails.height);
      // console.log('width', imageDetails.width);

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

  // When user click on an artist
  function onArtistClick(e) {
    e.preventDefault();
    const selectedArtist = e.target.closest('.artist-item');
    const artistId = selectedArtist.dataset.artistId;
    console.log('Selected Artist:', selectedArtist);
    console.log('Artist ID:', artistId);
    getArtistTopTracks(artistId);
    clearSearchResults();
  }
}

// Create HTML elements for tracks
function displayTracks(tracks, title) {
  const tracksContainer = document.createElement('div');
  tracksContainer.classList.add('tracks-container');

  const tracksTitle = document.createElement('h2');
  tracksTitle.textContent = title || 'Songs'; // Default to 'Songs' if title not provided

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

    // Add button to add track to playlist
    const addButton = document.createElement('button');
    addButton.classList.add('add-to-playlist');

    // Add plus icon inside the button
    const plusIcon = document.createElement('i');
    plusIcon.classList.add('fas', 'fa-plus');
    addButton.appendChild(plusIcon);

    // Set title for button tooltip
    addButton.title = 'Add to My Playlist';

    trackItem.appendChild(trackDetails);
    trackItem.appendChild(addButton);
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
    const selectedTrack = e.target.closest('.track-item');
    const trackId = selectedTrack.dataset.trackId;

    // Retrive track information from the selected track
    const trackInfo = {
      id: trackId,
      name: selectedTrack.querySelector('.track-details p').textContent,
      artist: selectedTrack.querySelector('.track-artist').textContent,
      image: selectedTrack.querySelector('img').src,
    };

    console.log('Selected Track:', selectedTrack);
    console.log('Track Info:', trackInfo);
    addToPlaylist(trackInfo);
  }
}

// Display Artist's top tracks
function displayArtistTopTracks(topTracks, artistDetails) {
  if (topTracks.tracks.length > 0) {
    //    // Display artist details
    displayArtistDetails(artistDetails);

    // Display top tracks
    displayTracks(topTracks.tracks, 'Top Songs');
  }
}

// Display Artist's details
function displayArtistDetails(artistDetails) {
  console.log(artistDetails);
  // Create HTML elements for artists
  const artistsContainer = document.createElement('div');
  artistsContainer.classList.add('artists-container');

  const artistsTitle = document.createElement('h2');
  artistsTitle.textContent = 'Artists';

  const artistItem = document.createElement('div');
  artistItem.classList.add('artist-item');

  // Check if artist has images and the image array is not empty
  if (artistDetails.images && artistDetails.images.length > 0) {
    const artistImage = document.createElement('img');
    const imageDetails = artistDetails.images[0];

    // Set the image attribute
    artistImage.src = imageDetails.url;

    //Set the height and width attributes
    artistImage.height = imageDetails.height;
    artistImage.width = imageDetails.width;

    artistItem.appendChild(artistImage);
  }

  //Create a paragraph for artist's name
  const artistName = document.createElement('p');
  artistName.textContent = artistDetails.name;
  artistItem.appendChild(artistName);

  const artistFollowers = document.createElement('p');
  artistFollowers.textContent = `Followers: ${artistDetails.followers.total}`;
  artistItem.appendChild(artistFollowers);
  console.log(artistFollowers);

  const artistGenres = document.createElement('p');
  artistGenres.textContent = `Genre: ${artistDetails.genres[0]}`;
  artistItem.appendChild(artistGenres);
  console.log(artistGenres);

  artistsContainer.appendChild(artistsTitle);
  artistsContainer.appendChild(artistItem);
  searchResults.appendChild(artistsContainer);
}
