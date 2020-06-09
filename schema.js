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

