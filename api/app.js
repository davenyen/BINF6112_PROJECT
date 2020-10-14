
// Refactor code soon
// Save parse data and access via front end with a GET method
// ALL EXCEL FILES HAVE BEEN MOVED TO 'client/public/uploads'
// EXCEL UPLOAD FROM FRONT END APPEARS -> 'api/public'

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var multer = require('multer')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

// MOVE TO DIFFERENT FILE LATER (PARSE ONE METHOD)
const xlsxFile = require('read-excel-file/node');

const parse = require('./components/parseTwo');
const map = require('./components/map');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
  cb(null, 'public')
},
filename: function (req, file, cb) {
  cb(null, file.originalname )
}
})

var upload = multer({ storage: storage }).single('file')

app.post('/upload',function(req, res) {
  upload(req, res, function (err) {
         if (err instanceof multer.MulterError) {
             return res.status(500).json(err)
         } else if (err) {
             return res.status(500).json(err)
         }
    return res.status(200).send(req.file)
  })
});

app.listen(8000, function() {
  console.log('App running on port 8000');
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// PARSE ONE METHOD MOVE TO DIFFERENT FILE LATER 
// CURRENTLY HARDCODED
var fileHandler = './public/ige.xlsx'; // MAKE THIS = TO WHATEVER FILE GOT MADE IN ./public

// xlsxFile(fileHandler).then((rows) => {
//   parsedObject = {
//       peptideSeq:[],
//       proteinId:[],
//       rawMean:[],
//       backgroundMean:[],
//       foregroundMedian:[]
//   }
//   parsedData = parsedObject;

//   for(i in rows){
//       for(j in rows[i]){
//           if(rows[i][j]!=null){
//               if(String(rows[i][j]) == "Peptide"){
//                   for(let row=Number(i)+1;row<rows.length; row++){
//                      parsedObject.peptideSeq.push(rows[row][j]);
//                   }
//               }else if(String(rows[i][j]) == "Antigen/Protein ID"){
//                   for(let row=Number(i)+1;row<rows.length; row++){
//                       parsedObject.proteinId.push(rows[row][j]);
//                    }
//               }else if(String(rows[i][j]).match(/Raw Mean/g)){
//                   for(let row=Number(i)+1;row<rows.length; row++){
//                       parsedObject.rawMean.push(rows[row][j]);
//                    }
//               }else if(String(rows[i][j]).match(/Background Mean/g)){
//                   for(let row=Number(i)+1;row<rows.length; row++){
//                       parsedObject.backgroundMean.push(rows[row][j]);
//                    }
//               }else if(String(rows[i][j]).match(/Foreground Median/g)){
//                   for(let row=Number(i)+1;row<rows.length; row++){
//                       parsedObject.foregroundMedian.push(rows[row][j]);
//                    }
//               }
//           }
//       }
//   }
//   console.log(parsedObject);
// })

parse.parse(fileHandler)
      .then(json => map.mapData(json))
      .then(json => console.log(json));

module.exports = app;
