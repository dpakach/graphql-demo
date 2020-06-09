const express = require("express");
const graphqlHttp = require("express-graphql");
const schema = require("./schema");

const app = express();

app.use(
  "/graphql",
  graphqlHttp({
    schema,
    graphiql: true,
  })
);

app.listen(8000, () => {
  console.log("listening on port:8000");
});
