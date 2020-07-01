const graphql = require("graphql");
const _ = require("lodash");

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLSchema,
  GraphQLList,
} = graphql;

let movies = [
  { id: "1", name: "Hatterika", genre: "Comedy", directorID: "1" },
  { id: "2", name: "Shootout", genre: "Thriller", directorID: "1" },
  { id: "3", name: "How to be kada", genre: "Mistery", directorID: "2" },
];

let directors = [
  { id: "1", name: "Talank Baral" },
  { id: "2", name: "Jack Robinson" },
  { id: "3", name: "Kiran Parajuli" },
];

const movieType = new GraphQLObjectType({
	name: "movie",
	fields: () => ({
		id: {type: GraphQLID},
		name: {type: GraphQLString},
		genre: {type: GraphQLString},
		directorID: {type: GraphQLString},
		director: {
			type: directorType,
			resolve(parent) {
				return _.find(directors, {id: parent.directorID})
			}
		}
	})
})

const movieResolver = {
	type: movieType,
	args: {id: {type: GraphQLID}},
	resolve(parent, args, context, info) {
		return _.find(movies, {id: args.id});
	}
}

const directorType = new GraphQLObjectType({
	name: "director",
	fields: {
		id: {type: GraphQLID},
		name: {type: GraphQLString},
		movie: {
			type: GraphQLList(movieType),
			resolve(parent, args) {
				return _.filter(movies, {directorID: parent.id})
			}
		}
	}
})

const directorResolver = {
	type: directorType,
	args: {id: {type: GraphQLID}},
	resolve(parent, args) {
		return _.find(directors, {id: args.id});
	}
}

const directorsResolver = {
	type: GraphQLList(directorType),
	resolve() {
		return directors
	}
}

const moviesResolver = {
	type: GraphQLList(movieType),
	resolve() {
		return movies
	}
}

const RootQuery = new GraphQLObjectType({
	name: "rootquery",
	fields: {
		movie: movieResolver,
		movies: moviesResolver,
		director: directorResolver,
		directors: directorsResolver
	}
})

module.exports = new GraphQLSchema({
	query: RootQuery
})

