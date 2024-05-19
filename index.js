const API_KEY = "1331833cc091b90ca845c57984eb1063";
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w200';

function fetchMovieData(endpoint, params = {}) {
    params.api_key = API_KEY;
    const url = new URL(endpoint, BASE_URL);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    console.log('Fetching data from:', url.toString()); // Debugging message
    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .catch(error => console.error('Error fetching data:', error)); // Debugging message
}

function getRandomMedia() {
  const isMovieChecked = document.getElementById('type-movie').checked;
  const isSeriesChecked = document.getElementById('type-series').checked;
  const selectedGenres = Array.from(document.querySelectorAll('.genre .options div.selected')).map(option => option.dataset.id);
  
  let mediaType;
  let endpoint;

  if (isMovieChecked && !isSeriesChecked) {
      mediaType = 'movie';
  } else if (!isMovieChecked && isSeriesChecked) {
      mediaType = 'tv';
  } else {
      // Choose randomly if both or neither are selected
      mediaType = Math.random() < 0.5 ? 'movie' : 'tv';
  }

  if (selectedGenres.length > 0) {
      endpoint = `${BASE_URL}/discover/${mediaType}`;
  } else {
      endpoint = `${BASE_URL}/${mediaType}/top_rated`;
  }

  const params = {
      with_genres: selectedGenres.join(','),
      api_key: API_KEY
  };

  return fetchMovieData(endpoint, params).then(data => {
      if (!data || !data.results) {
          console.error('No data or results in the response');
          return null;
      }
      const mediaList = data.results;
      return mediaList[Math.floor(Math.random() * mediaList.length)];
  });
}



function displayMedia(media) {
  if (!media) {
      console.error('No media found to display');
      return;
  }
  const mediaCover = document.getElementById('movie-cover');
  mediaCover.src = `${IMAGE_BASE_URL}${media.poster_path || media.backdrop_path}`;
  mediaCover.style.display = 'block'; // Show the media cover
  console.log('Displaying media:', media.title || media.name);
}

document.querySelector('.generate-btn').addEventListener('click', () => {
  getRandomMedia().then(media => {
      displayMedia(media);
  });
});

function getRandomMovieFromTMDb() {
  return fetchMovieData('https://api.themoviedb.org/3/movie/popular').then(data => {
      if (!data || !data.results) {
          console.error('No data or results in the response');
          return null;
      }
      console.log('Movies data:', data);
      const movies = data.results;
      return movies[Math.floor(Math.random() * movies.length)];
  });
}

function displayMovie(movie) {
    if (!movie) {
        console.error('No movie found to display'); // Debugging message
        return;
    }
    const movieCover = document.getElementById('movie-cover');
    movieCover.src = `${IMAGE_BASE_URL}${movie.poster_path}`;
    movieCover.style.display = 'block';
    console.log('Displaying movie:', movie.title); // Debugging message

    const today = new Date().toLocaleDateString();
    localStorage.setItem('lastFetchedMovie', JSON.stringify({ movie, date: today }));

}

document.querySelector('.todays-pick-btn').addEventListener('click', () => {
  fetchAndDisplayRandomMovie();
});

document.addEventListener('DOMContentLoaded', () => {
  const genreOptionsContainer = document.querySelector('.genre .options div');

  genreOptionsContainer.addEventListener('click', (event) => {
      if (event.target.tagName === 'DIV') {
          toggleGenre(event.target);
      }
  });
});

function toggleGenre(option) {
  if (option.classList.contains('selected')) {
      option.classList.remove('selected');
  } else {
      option.classList.add('selected');
  }
}

function fetchAndDisplayRandomMovie() {
  // Check if a movie was already fetched for today
  const lastFetchedMovie = JSON.parse(localStorage.getItem('lastFetchedMovie'));
  const today = new Date().toLocaleDateString();
  if (lastFetchedMovie && lastFetchedMovie.date === today) {
      // If a movie was already fetched today, display it
      displayMovie(lastFetchedMovie.movie);
  } else {
      // Otherwise, fetch a new random movie
      getRandomMovieFromTMDb().then(movie => {
          displayMovie(movie);
      });
  }
}

function toggleGenre(event) {
  if (event.target.classList.contains('selected')) {
      event.target.classList.remove('selected');
  } else {
      event.target.classList.add('selected');
  }
}
