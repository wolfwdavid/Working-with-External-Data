import * as Carousel from "/Carousel.js";
import axios from "axios";

// The breed selection input element.
const breedSelect = document.getElementById("breedSelect");
// The information section div element.
const infoDump = document.getElementById("infoDump");
// The progress bar div element.
const progressBar = document.getElementById("progressBar");
// The get favourites button element.
const getFavouritesBtn = document.getElementById("getFavouritesBtn");

// Step 0: Store your API key here for reference and easy access.
const API_KEY = 'live_Emqpg66Ia69I9yepqFBUnnBvxOJoaKX20yigbe1IkZvkrjPFBO9otgvUN1itcLhg';

// Set default axios settings
axios.defaults.baseURL = 'https://api.thecatapi.com/v1';
axios.defaults.headers.common['x-api-key'] = API_KEY;

/**
 * 1. Create an async function "initialLoad" that does the following:
 * - Retrieve a list of breeds from the cat API using axios.
 * - Create new <options> for each of these breeds, and append them to breedSelect.
 *  - Each option should have a value attribute equal to the id of the breed.
 *  - Each option should display text equal to the name of the breed.
 */
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

    // Call the breed selection event handler to populate carousel initially
    handleBreedSelection();
  } catch (error) {
    console.error('Error fetching breeds:', error);
  }
};

/**
 * 2. Create an event handler for breedSelect that does the following:
 * - Retrieve information on the selected breed from the cat API using axios.
 * - For each object in the response array, create a new element for the carousel.
 * - Use the other data to create an informational section within the infoDump element.
 * - Each new selection should clear, re-populate, and restart the Carousel.
 */
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
      Carousel.add(imgElement);
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

// Call the initial load immediately
initialLoad();

/**
 * 5. Add axios interceptors to log the time between request and response to the console.
 * - In your request interceptor, set the body element's cursor style to "progress."
 * - In your response interceptor, remove the progress cursor style from the body element.
 */
axios.interceptors.request.use(config => {
  console.log('Request started at', new Date().toISOString());
  document.body.style.cursor = 'progress'; // Show progress cursor
  progressBar.style.width = '0%'; 
  return config;
});

axios.interceptors.response.use(response => {
  console.log('Request finished at', new Date().toISOString());
  document.body.style.cursor = 'default'; // Reset cursor
  progressBar.style.width = '100%'; 
  return response;
});

/**
 * 6. Create a function "updateProgress" to handle axios onDownloadProgress.
 */
const updateProgress = (progressEvent) => {
  const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
  progressBar.style.width = `${percentage}%`;
  console.log(`Progress: ${percentage}%`);
};

/**
 * 8. To practice posting data, we'll create a system to "favourite" certain images.
 * Post to the cat API's favourites endpoint with the given ID.
 */
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

/**
 * 9. Create a getFavourites() function to retrieve all favourites from the cat API.
 * Clear the carousel and display your favourites when the button is clicked.
 */
const getFavourites = async () => {
  try {
    const response = await axios.get('/favourites');
    const favourites = response.data;

    // Clear carousel and display favourites
    Carousel.clear();
    favourites.forEach(favourite => {
      const imgElement = document.createElement('img');
      imgElement.src = favourite.image.url;
      Carousel.add(imgElement);
    });
  } catch (error) {
    console.error('Error fetching favourites:', error);
  }
};


getFavouritesBtn.addEventListener('click', getFavourites);

