const secret = "6431579d356b75728144f5d6ce38ad9a";

const upcomingMoviesUrl = `https://api.themoviedb.org/3/movie/upcoming?api_key=${secret}&language=en-IN&page=1`;

const topRatedMovies = `https://api.themoviedb.org/3/movie/top_rated?api_key=${secret}&language=en-IN&page=1`;

const popularMovies = `https://api.themoviedb.org/3/movie/popular?api_key=${secret}&language=en-IN&page=1`;

const nowPlayingMovies = `https://api.themoviedb.org/3/movie/now_playing?api_key=${secret}&language=en-IN&page=1`;


module.exports = {
    upcomingMoviesUrl: upcomingMoviesUrl,
    topRatedMovies: topRatedMovies,
    popularMovies: popularMovies,
    nowPlayingMovies: nowPlayingMovies,
    secret: secret
};