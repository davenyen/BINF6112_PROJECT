
const  createError = require('http-errors');
const  cookieParser = require('cookie-parser');
const  logger = require('morgan');
const  cors = require('cors');
const  multer = require('multer')

const  indexRouter = require('./routes/index');
const  usersRouter = require('./routes/users');

// MOVE TO DIFFERENT FILE LATER
const xlsxFile = require('read-excel-file/node');
const parse = require('./components/parseTwo');
const map = require('./components/map');
const ave = require('./components/multipleAve');
const fs = require('fs');

const express = require('express');
const path = require('path');
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

const isDev = process.env.NODE_ENV !== 'production';
const PORT = process.env.PORT || 5000;

const app = express();
let fileHandler = [];

// Priority serve any static files.
app.use(express.static(path.resolve(__dirname, './client/build')));

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
  fileHandler.push( './public/' + file.originalname);
}
});

var upload = multer({ storage: storage }).array('file')

app.post('/submit',function(req, res) {
  //console.log(fileHandler);
  upload(req, res, function (err) {
        if (err instanceof multer.MulterError || err) {
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

app.get('/processTemp', function(req, res, next) {
  console.log('processingTemp');
  let xlFiles = fileHandler.filter(a => !a.match(/.pdb$/));
  let pdbFile = fileHandler.filter(a => a.match(/.pdb$/));
    console.log('multiple parse in temp');
    parse.parseMultiple(xlFiles)
          .then(json => map.mapData(json, pdbFile))
          .then(json => {
            return res.status(200).json(json);
          });
});

app.post('/clear', function(req, res) {
  console.log('clearing');
  while (fileHandler.length > 0) fileHandler.pop();
  console.log(fileHandler);

  fs.readdir('./public', (err, files) => {
    files.forEach(f => {
      if (f.match(/.gpr$/) || f.match(/.xlsx$/) || f.match(/.pdb$/)) {
        console.log('heaya'+f);
        fs.unlink('./public/'+f, (error) => {
          if (error) throw error;
        });
      }
    });
  });
});

// Answer API requests.
app.get('/api', function (req, res) {
  res.set('Content-Type', 'application/json');
  res.send('{"message":"Hello from the custom server!"}');
});

// All remaining requests return the React app, so it can handle routing.
app.get('*', function(request, response) {
  response.sendFile(path.resolve(__dirname, './client/build', 'index.html'));
});

app.listen(PORT, function () {
  console.error(`Node ${isDev ? 'dev server' : 'cluster worker '+process.pid}: listening on port ${PORT}`);
});
