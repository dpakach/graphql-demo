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

const MovieType = new GraphQLObjectType({
  name: "movie",
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    genre: { type: GraphQLString },
    directorID: { type: GraphQLString },
    director: {
      type: DirectorType,
      resolve(parent, args) {
        return _.find(directors, { id: parent.directorID });
      },
    },
  }),
});

const MovieQuery = {
  type: MovieType,
  args: { id: { type: GraphQLID } },
  resolve(parent, args) {
    return _.find(movies, { id: args.id });
  },
};

const DirectorType = new GraphQLObjectType({
  name: "director",
  fields: {
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    movies: { type: GraphQLList(MovieType), resolve(parent, args) {
      return _.filter(movies,{directorID:parent.id})
    } },
  },
});

const DirectorQuery = {
  type: DirectorType,
  args: { id: { type: GraphQLID } },
  resolve(parent, args) {
    return _.find(directors, { id: args.id });
  },
};

const RootQuery = new GraphQLObjectType({
  name: "Rootquery",
  fields: {
    movie: MovieQuery,
    director: DirectorQuery,
  },
});

const addDirectorMutation = {
  type: DirectorType,
  args:{id:{type:GraphQLID}, name:{type:GraphQLString}},
  resolve(parent,args)
  {
    directors.push(args);
    console.log(directors);
    return args;
  }
}

const RootMutation = new GraphQLObjectType({
  name:"mutations",
  fields:{ addDirector : addDirectorMutation}
})

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation:RootMutation
});
