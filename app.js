const express = require("express");
const graphqlHttp = require("express-graphql");
const schema = require("./schema");

const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017";

const client = new MongoClient(url)

client.connect(function(err, db) {
	if (err) {
		throw err;
	}
	console.log("Connected to Database");

	const app = express();

	dbClient = client.db('Movies')

	app.use(
		"/graphql",
		(request, response) => {
			return graphqlHttp({
				schema,
				graphiql: true,
				context: {
					dbClient,
				}
			})(request, response)
		});

	app.listen(8000, () => {
		console.log("listening on port:8000");
	});
})

