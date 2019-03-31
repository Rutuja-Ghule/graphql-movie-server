const axios = require('axios');
const movieRestApis = require('./apiConfig')

const {
    GraphQLObjectType,
    GraphQLInt,
    GraphQLFloat,
    GraphQLString,
    GraphQLList,
    GraphQLSchema,
    GraphQLEnumType,
    GraphQLID,
    GraphQLBoolean
} = require('graphql');

const MovieType = new GraphQLObjectType({
    name: 'Movie',
    fields: () => ({
        id: { type: GraphQLID },
        imdb: { type: GraphQLString },
        title: { type: GraphQLString },
        tagline: { type: GraphQLString },
        overview: { type: GraphQLString },
        poster_path: { type: GraphQLString },
        release_date: { type: GraphQLString },
        budget: { type: GraphQLInt },
        revenue: { type: GraphQLInt },
        runtime: { type: GraphQLInt },
        status: { type: GraphQLString },
        vote_average: { type: GraphQLFloat },
        casts: { type: GraphQLList(PersonType) },
        crew: { type: GraphQLList(PersonType) },
        reviews: { type: GraphQLList(MovieReviewType) },
        genres: { type: GraphQLList(GenreType) },
        videos: { type: GraphQLList(VideoType) }
    })
});

const PersonType = new GraphQLObjectType({
    name: 'Person',
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        character: { type: GraphQLString },
        imdb_id: { type: GraphQLString },
        profile_path: { type: GraphQLString },
        place_of_birth: { type: GraphQLString },
        popularity: { type: GraphQLFloat },
        biography: { type: GraphQLString },
        birthday: { type: GraphQLString },
        deathday: { type: GraphQLString },
        job: { type: GraphQLString },
        department: { type: GraphQLString },
        gender: { type: GraphQLBoolean },
        credits: { type: GraphQLList(MovieType) }
    })
});

const MovieReviewType = new GraphQLObjectType({
    name: 'Review',
    fields: () => ({
        id: { type: GraphQLID },
        author: { type: GraphQLString },
        content: { type: GraphQLString }
    })
});

const GenreType = new GraphQLObjectType({
    name: 'Genre',
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString }
    })
});

const VideoType = new GraphQLObjectType({
    name: 'Video',
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        type: { type: GraphQLString },
        size: { type: GraphQLInt },
        key: { type: GraphQLString },
        site: { type: GraphQLString }
    })
});

const MovieListType = new GraphQLEnumType({
    name: 'List_type',
    values: {
        TOP_RATED: { value: 'top_rated' },
        UP_COMING: { value: 'upcoming' },
        POPULAR: { value: 'popular' },
        NOW_PLAYING: { value: 'now_playing' }
    }
});



const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        movieList: {
            type: new GraphQLList(MovieType),
            args: {
                list_type: { type: MovieListType }
            },
            resolve(parent, args) {
                return getMovieList(args.movie_type);
            }
        },
        movieDetails: {
            type: MovieType,
            args: {
                id: { type: GraphQLID }
            },
            resolve(parent, args) {
                return Promise.all([getMovieDetails(args.id), getMovieReviews(args.id)]).then(function (values) {
                    console.log(values);
                    data = values[0];
                    data.reviews = values[1];
                    return data;
                });
            }
        },
        actorDetails: {
            type: PersonType,
            args: {
                id: { type: GraphQLID }
            },
            resolve(parent, args) {
                return getActorDetails(args.id);
            }
        }
    }
});

function getMovieList(movieType) {
    let movieListEndpoint = movieRestApis.upcomingMoviesUrl;
    switch (movieType) {
        case 'top_rated':
            movieListEndpoint = movieRestApis.topRatedMovies;
            break;
        case 'upcoming':
            movieListEndpoint = movieRestApis.upcomingMoviesUrl;
            break;
        case 'popular':
            movieListEndpoint = movieRestApis.popularMovies;
            break;
        case 'now_playing':
            movieListEndpoint = movieRestApis.nowPlayingMovies;
            break;
    }
    return axios
        .get(movieListEndpoint)
        .then(res => {
            res.data.results.map(movie => movie.poster_path = 'https://image.tmdb.org/t/p/w500' + movie.poster_path)
            return res.data.results;
        })
}

function getMovieDetails(movieId) {
    return axios
        .get(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${movieRestApis.secret}&append_to_response=videos,casts`)
        .then(res => {
            res.data.poster_path = 'https://image.tmdb.org/t/p/w500' + res.data.poster_path;
            res.data.crew = res.data.casts.crew,
                res.data.casts = res.data.casts.cast;
            res.data.casts.map(cast => cast.profile_path = 'https://image.tmdb.org/t/p/w500' + cast.profile_path);
            res.data.videos = res.data.videos.results;
            return res.data;
        });
}

function getMovieReviews(movieId) {
    return axios.get(`https://api.themoviedb.org/3/movie/${movieId}/reviews?api_key=${movieRestApis.secret}`)
        .then(res => res.data.results);
}

function getActorDetails(actorId) {
    return axios.get(`https://api.themoviedb.org/3/person/${actorId}?api_key=${movieRestApis.secret}&append_to_response=credits`)
        .then(res => {
            res.data.profile_path = 'https://image.tmdb.org/t/p/w500' + res.data.profile_path;
            res.data.credits = res.data.credits.cast;
            return res.data;
        });
}

module.exports = new GraphQLSchema({
    query: RootQuery
});