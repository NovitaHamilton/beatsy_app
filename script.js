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
      `https://api.spotify.com/v1/search?q=${searchInput}&type=artist%2Ctrack%2Calbum`,
      {
        method: 'GET',
        headers: { Authorization: 'Bearer ' + token },
      }
    );
    const data = await response.json();
    console.log(data.artists.items[0].images[0].url);
    displaySearchResult(data);
  } catch (error) {
    console.error('Fetch error', error);
  }
};

const displaySearchResult = function (data) {
  elementSearchResult.style.opacity = 1;
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
    console.log(searchInput);

    searchItem(searchInput);
    elementSearchBar.value = '';
  }
}
