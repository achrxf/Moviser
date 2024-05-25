const API_KEY = "1331833cc091b90ca845c57984eb1063";
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w200';

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

function displayMovie(movie) {
  if (!movie) {
      return;
  }
  const movieCover = document.getElementById('movieCover');
  const logo = document.getElementById('logo');
  movieCover.src = `${IMAGE_BASE_URL}${movie.poster_path}`;
  movieCover.style.display = 'block';
  logo.style.opacity = '0';
  console.log('Displaying movie:', movie.title);
  const today = new Date().toLocaleDateString();
  localStorage.setItem('lastFetchedMovie', JSON.stringify({ movie, date: today }));
}

function getSelectedGenreIds() {
  const selectedGenres = [];
  const genreElements = document.querySelectorAll('.genre .options div.selected');
  genreElements.forEach(genreElement => {
      selectedGenres.push(genreElement.getAttribute('data-id'));
  });
  return selectedGenres;
}

function getRandomMedia() {
  const isMovieChecked = document.getElementById('typeMovie').checked;
  const isSeriesChecked = document.getElementById('typeTVshow').checked;
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

function displayMedia(media) {
  if (!media) {
      console.error('No media found to display');
      return;
  }
  const mediaName = media.title || media.name;
  const mediaDescription = media.overview;
  const detailsHeading = document.querySelector('.about .mediaName');
  const detailsParagraph = document.querySelector('.about .paragraph');
  
  // Set the media name as the heading text
  detailsHeading.textContent = mediaName;
  
  // Set the media description as the paragraph text
  detailsParagraph.textContent = mediaDescription;
  
  const mediaCover = document.getElementById('movieCover');
  const logo = document.getElementById('logo');
  mediaCover.src = `${IMAGE_BASE_URL}${media.poster_path || media.backdrop_path}`;
  mediaCover.style.display = 'block';
  logo.style.opacity = '0';
  console.log('Displaying media:', mediaName);
}

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

function createActorOption(actor) {
  const option = document.createElement('div');
  option.classList.add('actorOption');
  option.dataset.id = actor.id;
  option.textContent = actor.name;
  return option;
}

function displayPopularActors(actors) {
  const optionsContainer = document.getElementById('actorOptions');
  optionsContainer.innerHTML = '';
  actors.forEach(actor => {
      const option = createActorOption(actor);
      optionsContainer.appendChild(option);
      option.addEventListener('click', () => {
          option.classList.toggle('selected');
      });
  });

  const actorSearchInput = document.getElementById('actorSearch');
  actorSearchInput.addEventListener('input', () => {
      const filter = actorSearchInput.value.toLowerCase();
      actors.forEach(actor => {
          const option = document.querySelector(`.actorOption[data-id="${actor.id}"]`);
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

fetchPopularActors()
    .then(data => {
        if (data && data.results) {
            displayPopularActors(data.results);
        }
});

document.addEventListener('DOMContentLoaded', () => {
  fetchPopularActors();
});

function getSelectedActorIds() {
  const selectedActors = [];
  const actorElements = document.querySelectorAll('.actorOption.selected');
  actorElements.forEach(actorElement => {
      selectedActors.push(actorElement.dataset.id);
  });
  return selectedActors;
}

document.querySelector('.genButton').addEventListener('click', () => {
  getRandomMedia().then(media => {
      displayMedia(media);
  });
});

document.querySelector('.mwtButton').addEventListener('click', () => {
  fetchAndDisplayRandomMovie();
});

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

document.addEventListener('DOMContentLoaded', () => {
  const genreSearchInput = document.getElementById('genreSearch');
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

function fetchAndDisplayRandomMedia() {
  getRandomMedia().then(media => {
      displayMedia(media);
  });
}

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