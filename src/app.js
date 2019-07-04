const express	= require('express');
const multer	= require('multer');
const cors	= require('cors');
const path	= require('path');

const upload	= require('./routes/uploads.routes.js');

const PORT = 3333;

app = express();
app.use(cors());
app.use("/upload", upload);
app.listen(PORT, function(){
	console.log("App listening in port " + PORT);
});
