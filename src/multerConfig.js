const multer = require('multer');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads');
  },
  filename: function (req, file, cb) {
   // let DateString = new Date();
   // console.log(Date.now());
   // let currentDate = DateString.getDate() + "" + DateString.getMonth()  +  "" + DateString.getFullYear() + "" + DateString.getHours() + "" + DateString.getMinutes();
    cb(null, file.originalname);
  }
})
 
module.exports = multer({ storage: storage });
