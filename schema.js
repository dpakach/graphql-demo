const graphql = require("graphql");
const _ = require("lodash");
const {ObjectId} = require('mongodb');

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLSchema,
  GraphQLList,
} = graphql;

const DIRECTORS = 'directors'
const MOVIES = 'movies'

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
			async resolve(parent, args, context) {
				//return _.find(directors, {id: parent.directorID})
				const directors = context.dbClient.collection(DIRECTORS)
				const list = await new Promise((resolve, reject) => {
					directors.find({_id: ObjectId(parent.directorID)}).toArray((err, data) => {
						if (err) reject(err)
						resolve(data)
					});
				});
				return convertId(list)[0]
			}
		}
	})
})

const movieResolver = {
	type: movieType,
	args: {id: {type: GraphQLString}},
	async resolve(parent, args, context, info) {
		//return _.find(movies, {id: args.id});
		const movies = context.dbClient.collection(MOVIES)
		const data = await new Promise((resolve, reject) => {
			movies.find({_id: ObjectId(args.id)}).toArray((err, data) => {
				if (err) reject(err)
				resolve(data)
			});
		});

		return convertId(data)[0]
	}
}

const directorType = new GraphQLObjectType({
	name: "director",
	fields: {
		id: {type: GraphQLString},
		name: {type: GraphQLString},
		movie: {
			type: GraphQLList(movieType),
			async resolve(parent, args, context) {
				//return _.filter(movies, {directorID: parent.id})
				const movies = context.dbClient.collection(MOVIES)
				const list = await new Promise((resolve, reject) => {
					movies.find({directorID: String(parent.id)}).toArray((err, data) => {
					//movies.find({directorID: '5efca0c251832f309d1eff17'}).toArray((err, data) => {
						if (err) reject(err)
						resolve(data)
					});
				});
				return convertId(list)
			}
		}
	}
})

const directorResolver = {
	type: directorType,
	args: {id: {type: GraphQLString}},
	async resolve(parent, args, context) {
		//return _.find(directors, {id: args.id});
		const directors = context.dbClient.collection(DIRECTORS)
		const list = await new Promise((resolve, reject) => {
			directors.find({_id: ObjectId(args.id)}).toArray((err, data) => {
				if (err) reject(err)
				resolve(data)
			});
		});
		return convertId(list)[0]
	}
}

const convertId = function(array) {
	return array.map(item => {
		item.id = item._id
		delete item._id
		return item
	})
}

const directorsResolver = {
	type: GraphQLList(directorType),
	async resolve(parent, args, context) {
		const directors = context.dbClient.collection(DIRECTORS)
		const list = await new Promise((resolve, reject) => {
			directors.find({}).toArray((err, data) => {
				if (err) reject(err)
				resolve(data)
			});
		});
		return convertId(list)
	}
}

const moviesResolver = {
	type: GraphQLList(movieType),
	async resolve(parent, args, context) {
		const movies = context.dbClient.collection(MOVIES)
		const data = await new Promise((resolve, reject) => {
			movies.find({}).toArray((err, data) => {
				if (err) reject(err)
				resolve(data)
			});
		});

		return convertId(data)
	}
}

const directorInput = new graphql.GraphQLInputObjectType({
	name: 'DirectorInput',
	fields: {
		name: {type: GraphQLString},
	}
})

const movieInput = new graphql.GraphQLInputObjectType({
	name: 'MovieInput',
	fields: {
		name: {type: GraphQLString},
		directorID: {type: graphql.GraphQLID}
	}
})

const mutationType = new GraphQLObjectType({
	name: 'Mutation',
	fields: {
		addMovie: {
			type: movieType,
			args: {
				input: {type: movieInput}
			},
			resolve: async function(parent, args, context) {
				const movie = {
					name: args.input.name,
					directorID: args.input.directorID
				}

				const movies = context.dbClient.collection(MOVIES)
				const directors = context.dbClient.collection(DIRECTORS)

				const dirs = await new Promise((resolve, reject) => {
					directors.find({_id: ObjectId(movie.directorID)}).toArray((err, data) => {
						if (err) reject(err)
						resolve(data)
					});
				});

				if (dirs.length < 1) {
					return
				}

				data = await new Promise((resolve, reject) => {
					movies.insert(movie, (err, data) => {
						if (err) reject(err)
						resolve(data)
					});
				});
				return convertId(data.ops)[0]
			}
		},
		addDirector: {
			type: directorType,
			args: {
				input: {type: directorInput}
			},
			resolve: async function(parent, args, context) {
				const director = {
					name: args.input.name,
				}

				const directors = context.dbClient.collection(DIRECTORS)

				data = await new Promise((resolve, reject) => {
					directors.insert(director, (err, data) => {
						if (err) reject(err)
						resolve(data)
					});
				});
				return convertId(data.ops)[0]
			}
		}
	}
})

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
	query: RootQuery,
	mutation: mutationType
})

