const express	= require('express');
const { graphql, buildSchema } = require('graphql');
const multer	= require('multer');
const cors	= require('cors');
const path	= require('path');

const upload	= require('./routes/uploads.routes.js');
/*
let schema = buildSchema(`
  type Query {
    hello: String
  }
`);
let root = {
  'hello': () => {
    return 'Hello world!';
  },
};
graphql(schema, '{ hello }', root).then((response) => {
  console.log(response);
});
*/
const PORT = 3333;

app = express();
app.use(cors());
app.use("/upload", upload);
app.listen(PORT, function(){
console.log("App listening in port " + PORT);
});
