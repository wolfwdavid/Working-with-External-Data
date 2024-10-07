import * as Carousel from "./Carousel.js";
import axios from "axios";

// The breed selection input element.
const breedSelect = document.getElementById("breedSelect");
const infoDump = document.getElementById("infoDump");
const progressBar = document.getElementById("progressBar");
const getFavoritesBtn = document.getElementById("getFavoritesBtn");

// API key
const API_KEY = 'live_Emqpg66Ia69I9yepqFBUnnBvxOJoaKX20yigbe1IkZvkrjPFBO9otgvUN1itcLhg';


// Set default axios settings
axios.defaults.baseURL = 'https://api.thecatapi.com/v1';
axios.defaults.headers.common['x-api-key'] = API_KEY;

// Load breeds
const initialLoad = async () => {
  try {
    const response = await axios.get('/breeds');
    const breeds = response.data;

    breeds.forEach(breed => {
      const option = document.createElement('option');
      option.value = breed.id;
      option.textContent = breed.name;
      breedSelect.appendChild(option);
    });

    // Populate the carousel initially
    handleBreedSelection();
  } catch (error) {
    console.error('Error fetching breeds:', error);
  }
};

// Handle breed selection
const handleBreedSelection = async () => {
  const breedId = breedSelect.value;
  try {
    const response = await axios.get(`/images/search?breed_id=${breedId}&limit=5`, {
      onDownloadProgress: updateProgress
    });

    const images = response.data;
    Carousel.clear();
    infoDump.innerHTML = '';

    images.forEach(imageData => {
      const imgElement = document.createElement('img');
      imgElement.src = imageData.url;
      Carousel.appendCarousel(imgElement);
    });

    const breedInfo = images[0].breeds[0];
    if (breedInfo) {
      infoDump.innerHTML = `
        <h2>${breedInfo.name}</h2>
        <p>${breedInfo.description}</p>
        <p>Temperament: ${breedInfo.temperament}</p>
      `;
    }
  } catch (error) {
    console.error('Error fetching breed data:', error);
  }
};

// Attach event listener to breedSelect
breedSelect.addEventListener('change', handleBreedSelection);

// Load initial data
initialLoad();

// Axios interceptors
axios.interceptors.request.use(config => {
  console.log('Request started at', new Date().toISOString());
  document.body.style.cursor = 'progress';
  progressBar.style.width = '0%';
  return config;
});

axios.interceptors.response.use(response => {
  console.log('Request finished at', new Date().toISOString());
  document.body.style.cursor = 'default';
  progressBar.style.width = '100%';
  return response;
});

// Update progress bar
const updateProgress = (progressEvent) => {
  const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
  progressBar.style.width = `${percentage}%`;
  console.log(`Progress: ${percentage}%`);
};

// Favorite function
export async function favourite(imgId) {
  try {
    const response = await axios.post('/favourites', {
      image_id: imgId
    });
    console.log('Image favorited:', response.data);
  } catch (error) {
    console.error('Error favoriting image:', error);
  }
}

// Get favorites
const getFavorites = async () => {
  try {
    const response = await axios.get('/favourites');
    const favorites = response.data;

    Carousel.clear();
    favorites.forEach(favorite => {
      const imgElement = document.createElement('img');
      imgElement.src = favorite.image.url;
      Carousel.appendCarousel(imgElement);
    });
  } catch (error) {
    console.error('Error fetching favorites:', error);
  }
};

// Attach event listener to getFavoritesBtn
getFavoritesBtn.addEventListener('click', getFavorites);
