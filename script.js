'use strict';
import { myClientId, myClientSecret } from './config.js';

console.log(myClientId, myClientSecret);

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

getToken();

// Function for the search bar
const searchItem = async (token) => {
  try {
    const token = await getToken();
    console.log(token);
    const response = await fetch(
      'https://api.spotify.com/v1/search?q=masego&type=artist%2Ctrack%2Calbum',
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

// searchItem();

const displaySearchResult = async () => {
  const searchResult = await searchItem();
  console.log(searchResult);
};

displaySearchResult();

//-----------------------------------Elemement Selector-----------------------------//

const elementSearchBar = document.querySelector('.search-bar');
const elementSearchResult = document.querySelector('.search-result');

//------------------------------------Event Listener------------------------------//

elementSearchBar.addEventListener('keydown', searchOnEnter); // Capturing 'Enter' on search bar

//-----------Functions---------------//

function searchOnEnter(e) {
  console.log(e.key);
  if (e.key === 'Enter') {
    searchItem();
  }
}
