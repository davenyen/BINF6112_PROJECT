
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

// MOVE TO DIFFERENT FILE LATER
const xlsxFile = require('read-excel-file/node');
const parse = require('./components/parseTwo');
const map = require('./components/map');
const ave = require('./components/multipleAve');
const fs = require('fs');
let fileHandler = [];

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
  fileHandler.push('./public/' + file.originalname);
}
})

var upload = multer({ storage: storage }).array('file')

app.post('/submit',function(req, res) {
  //console.log(fileHandler);
  upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(500).json(err)
        } else if (err) {
            return res.status(500).json(err)
        }
  return res.status(200).send(req.file)
  })
});

app.get('/process', function(req, res, next) {
  // var fileHandler = './public/ige.xlsx';
  // parse.parse(fileHandler)
  //       .then(json => map.mapData(json))
  //       .then(json => {
  //         return res.status(200).json(json)
  //       });
  console.log('processing');
  let xlFiles = fileHandler.filter(a => !a.match(/.pdb$/));
  let pdbFile = fileHandler.filter(a => a.match(/.pdb$/));
  console.log(fileHandler);
  console.log(xlFiles);
  if (xlFiles.length === 1) {
    parse.parse(xlFiles[0])
          .then(json => map.mapData(json, pdbFile))
          .then(json => {
            // console.log(json);
            return res.status(200).json(json);
          });
  } else if (xlFiles.length > 1) {
    console.log('multiple parse');
    parse.parseMultiple(xlFiles)
          .then(json => map.mapData(json, pdbFile))
          .then(json => {
            return res.status(200).json(json);
          });
  }
});

app.get('/processMult', function(req, res, next) {
  console.log('processingMult');
  let xlFiles = fileHandler.filter(a => !a.match(/.pdb$/));
  let pdbFile = fileHandler.filter(a => a.match(/.pdb$/));
    console.log('multiple parse in mult');
    parse.parseMultiple(xlFiles)
          .then(json => map.mapData(json, pdbFile))
          .then(json => ave.aveData(json))
          .then(json => {
            return res.status(200).json(json);
          });
});

app.post('/clear', function(req, res) {
  console.log('clearing');
  while (fileHandler.length > 0) { fileHandler.pop() }
  console.log(fileHandler);

  fs.readdir('./public', (err, files) => {
    files.forEach(f => {
      if (f.match(/.gpr$/) || f.match(/.xlsx$/) || f.match(/.pdb$/)) {
        console.log('heaya'+f);
        fs.unlink('./public/'+f, (err) => {
          if (err) throw err;
        });
      }
    });

  })
})

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

module.exports = app;
