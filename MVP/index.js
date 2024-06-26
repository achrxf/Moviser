const API_KEY = "1331833cc091b90ca845c57984eb1063";
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w200';

/**
 * function fetchMovieData(endpoint, params = {})
 * Fetches movie data from the TMDB API endpoint with given parameters.
 * @param {string} endpoint - The specific API endpoint to send the request to.
 * @param {Object} params - An optional object containing query parameters to include in the request.
 */
function fetchMovieData(endpoint, params = {}) {
    params.api_key = API_KEY;
    const url = new URL(endpoint, BASE_URL);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .catch(error => console.error('Error fetching data:', error));
}

/**
 * function getRandomMovieFromTMDb()
 * Fetches a list of popular movies from TMDb and returns a random movie from the list.
 */
function getRandomMovieFromTMDb() {
  return fetchMovieData('https://api.themoviedb.org/3/movie/popular').then(data => {
      if (!data || !data.results) {
          console.error('No data or results in the response');
          return null;
      }
      const movies = data.results;
      return movies[Math.floor(Math.random() * movies.length)];
  });
}

/**
 * function displayMovie(movie)
 * Displays a given movie's cover image on the webpage and logs its title. 
 * @param {Object} movie - The movie object containing details such as `poster_path` and `title`.
 */
function displayMovie(movie) {
    if (!movie) {
        return;
    }
    const movieCover = document.getElementById('movie-cover');
    movieCover.src = `${IMAGE_BASE_URL}${movie.poster_path}`;
    movieCover.style.display = 'block';
    console.log('Displaying movie:', movie.title);
    const today = new Date().toLocaleDateString();
    localStorage.setItem('lastFetchedMovie', JSON.stringify({ movie, date: today }));
}

/**
 * function getSelectedGenreIds()
 * Retrieves the IDs of selected genres from the HTML elements with the class 'genre'.
 * @returns {Array} - An array containing the IDs of selected genres.
 */
function getSelectedGenreIds() {
    const selectedGenres = [];
    const genreElements = document.querySelectorAll('.genre .options div.selected');
    genreElements.forEach(genreElement => {
        selectedGenres.push(genreElement.getAttribute('data-id'));
    });
    return selectedGenres;
}

/**
 * function getRandomMedia()
 * Fetches a list of media from TMDb and returns a random movie or TV show.
 */
function getRandomMedia() {
    const isMovieChecked = document.getElementById('type-movie').checked;
    const isSeriesChecked = document.getElementById('type-series').checked;
    let mediaTypes;
    if (isMovieChecked && !isSeriesChecked) {
        mediaTypes = 'movie';
    } else if (!isMovieChecked && isSeriesChecked) {
        mediaTypes = 'tv';
    } else {
        mediaTypes = Math.random() < 0.5 ? 'movie' : 'tv';
    }

    const selectedGenres = getSelectedGenreIds();
    const selectedActors = getSelectedActorIds();
    const selectedMode = getSelectedMode();
    const modeGenres = selectedMode ? modeToGenreMapping[selectedMode] : [];

    // Combine selected genres with mode-based genres
    const genres = [...new Set([...selectedGenres, ...modeGenres])];
    const genreQuery = genres.length > 0 ? `&with_genres=${genres.join(',')}` : '';
    const actorQuery = selectedActors.length > 0 ? `&with_people=${selectedActors.join(',')}` : '';

    const endPoint = `${BASE_URL}/discover/${mediaTypes}`;
    const params = {
        sort_by: 'popularity.desc',
        with_genres: genres.join(','),
        with_people: selectedActors.join(',')
    };

    return fetchMovieData(endPoint, params).then(data => {
        if (!data || !data.results) {
            return null;
        }
        const mediaList = data.results;
        return mediaList[Math.floor(Math.random() * mediaList.length)];
    });
}

/**
 * function displayMedia(media)
 * Displays a given movie or TV show cover image on the webpage and logs its title. 
 * @param {Object} media - The media object containing details such as `poster_path` and `title`.
 */
function displayMedia(media) {
    if (!media) {
        console.error('No media found to display');
        return;
    }
    const mediaCover = document.getElementById('movie-cover');
    mediaCover.src = `${IMAGE_BASE_URL}${media.poster_path || media.backdrop_path}`;
    mediaCover.style.display = 'block';
    console.log('Displaying media:', media.title || media.name);
}

/**
 * Fetches data about popular actors from TMDb API.
 */
function fetchPopularActors() {
    const url = `${BASE_URL}/person/popular?api_key=${API_KEY}`;
    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .catch(error => console.error('Error fetching popular actors:', error));
}

/**
 * Creates a new DOM element representing an actor option.
 * @param {Object} actor - An object containing data about the actor, including their ID and name.
 */
function createActorOption(actor) {
    const option = document.createElement('div');
    option.classList.add('actor-option');
    option.dataset.id = actor.id;
    option.textContent = actor.name;
    return option;
}

/**
 * Displays a list of popular actors on the webpage and provides functionality for selecting actors and searching for specific actors.
 * @param {Array} actors - An array containing data about popular actors.
 */
function displayPopularActors(actors) {
    const optionsContainer = document.getElementById('actor-options');
    optionsContainer.innerHTML = '';
    actors.forEach(actor => {
        const option = createActorOption(actor);
        optionsContainer.appendChild(option);
        option.addEventListener('click', () => {
            option.classList.toggle('selected');
        });
    });

    const actorSearchInput = document.getElementById('actor-search');
    actorSearchInput.addEventListener('input', () => {
        const filter = actorSearchInput.value.toLowerCase();
        actors.forEach(actor => {
            const option = document.querySelector(`.actor-option[data-id="${actor.id}"]`);
            if (!option) {
                console.log(`Option not found for actor with ID ${actor.id}`);
                return;
            }
            if (actor.name.toLowerCase().includes(filter)) {
                option.style.display = '';
            } else {
                option.style.display = 'none';
            }
        });
    });
}

/**
 * Fetches data about popular actors from TMDb API and displays them on the webpage.
 */
fetchPopularActors()
    .then(data => {
        if (data && data.results) {
            displayPopularActors(data.results);
        }
});

/**
 * Adds an event listener to execute code when the DOM content is fully loaded.
 */
document.addEventListener('DOMContentLoaded', () => {
    fetchPopularActors();
});

/**
 * Retrieves the IDs of selected actors from the HTML elements.
 */
function getSelectedActorIds() {
    const selectedActors = [];
    const actorElements = document.querySelectorAll('.actor-option.selected');
    actorElements.forEach(actorElement => {
        selectedActors.push(actorElement.dataset.id);
    });
    return selectedActors;
}

/**
 * Adds an event listener to the button Generate.
 * When the button is clicked, it fetches and displays a random media for now.
 */
document.querySelector('.generate-btn').addEventListener('click', () => {
    getRandomMedia().then(media => {
        displayMedia(media);
    });
});

/**
 * Adds an event listener to the button Todays pick.
 * When the button is clicked, it fetches and displays a random movie.
 */
document.querySelector('.todays-pick-btn').addEventListener('click', () => {
  fetchAndDisplayRandomMovie();
});

/**
 * function fetchAndDisplayRandomMovie()
 * Fetches and displays a random movie. If a movie has already been fetched today,
 * it retrieves that movie from local storage and displays it. Otherwise, it fetches
 * a new random movie from TMDb and displays it.
 */
function fetchAndDisplayRandomMovie() {
    const lastFetchedMovie = JSON.parse(localStorage.getItem('lastFetchedMovie'));
    const today = new Date().toLocaleDateString();
    if (lastFetchedMovie && lastFetchedMovie.date === today) {
        displayMedia(lastFetchedMovie.movie);
    } else {
        getRandomMovieFromTMDb().then(movie => {
            if (movie) {
                const today = new Date().toLocaleDateString();
                localStorage.setItem('lastFetchedMovie', JSON.stringify({ movie, date: today }));
                displayMedia(movie);
            }
        });
    }
}

/**
 * Adds event listeners for genre selection and search functionality.
 */
document.addEventListener('DOMContentLoaded', () => {
    const genreSearchInput = document.getElementById('genre-search');
    const genreOptions = document.querySelectorAll('.genre .options div');

    genreOptions.forEach(option => {
        option.addEventListener('click', () => {
            option.classList.toggle('selected');
        });
    });

    genreSearchInput.addEventListener('input', () => {
        const filter = genreSearchInput.value.toLowerCase();
        genreOptions.forEach(option => {
            if (option.textContent.toLowerCase().includes(filter)) {
                option.style.display = '';
            } else {
                option.style.display = 'none';
            }
        });
    });
});

//------------------

/**
 * Displays a given movie or TV show on the webpage.
 * @param {Object} media - The media object containing details such as `title`, `name`, and `overview`.
 */
function displayMedia(media) {
    if (!media) {
        console.error('No media found to display');
        return;
    }
    const mediaName = media.title || media.name;
    const mediaDescription = media.overview;
    const detailsHeading = document.querySelector('.details h3');
    const detailsParagraph = document.querySelector('.details .paragraph');
    
    // Set the media name as the heading text
    detailsHeading.textContent = mediaName;
    
    // Set the media description as the paragraph text
    detailsParagraph.textContent = mediaDescription;
    
    const mediaCover = document.getElementById('movie-cover');
    mediaCover.src = `${IMAGE_BASE_URL}${media.poster_path || media.backdrop_path}`;
    mediaCover.style.display = 'block';
    console.log('Displaying media:', mediaName);
}

/**
 * Fetches and displays a random media (either a movie or a TV show).
 */
function fetchAndDisplayRandomMedia() {
    getRandomMedia().then(media => {
        displayMedia(media);
    });
}

//--------------------

const modeToGenreMapping = {
    happy: [35], // Comedy
    neutral: [], // No specific genre
    sad: [18] // Drama
};

function getSelectedMode() {
    const modes = document.getElementsByName('mode');
    for (let i = 0; i < modes.length; i++) {
        if (modes[i].checked) {
            return modes[i].value;
        }
    }
    return null;
}

