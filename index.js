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