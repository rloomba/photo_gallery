
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , path = require('path')
  , fs = require('fs')
  , im = require('imagemagick')
  , format = require('util').format
  , DataBaseProvider = require('./databaseprovider-mongodb').DataBaseProvider
  , AM = require('./account-manager');

var app = module.exports = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.limit('5mb'));
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// # sets up db inside here
var mongoURI = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL
|| '127.0.0.1';
var dataBaseProvider = new DataBaseProvider(mongoURI, 27017);

// main index get route
app.get('/', function(req, res){
  dataBaseProvider.findAll(function(error, photos){
    res.render('index.ejs', {locals: {
      title: "Photos",
      photos: photos
      }
    });
  });
});

// route to display form to upload new photo
app.get('/photo/new', function(req, res){
  res.render('photo_new.ejs', {locals: {
    title: 'New Photo'
    }
  });
});

// route to post new photo data to server
app.post('/photo/new', function(req,res){
  var temp_path = req.files.image.path;
  var target_path =  __dirname + '/public/storage/full/' + req.files.image.name;
  var img_path = '/storage/full/' + req.files.image.name;
  var thumbnail_location = __dirname + '/public/storage/thumbnail/' + req.files.image.name;
  var thumbnail_path = '/storage/thumbnail/' + req.files.image.name;

  //save full image to disk

  fs.rename(temp_path, target_path, function(err){
    if (err) throw err;
    res.redirect('/');
    // resize image and save thumbnail
    im.resize({
      srcPath: target_path,
      dstPath: thumbnail_location,
      width: 256,
      height: 256
    }, function(err, stdout, stderr){
      if (err) throw err;
      console.log('resized image');
      fs.unlink(temp_path, function(){
        if (err) throw err;
        // save data to database
        dataBaseProvider.savePhoto({
        name: req.param('name'),
        description: req.param('description'),
        full_location: img_path,
        thumbnail_location: thumbnail_path
        }, function(error, docs){
          console.log("saved to database");
        });
      });
    });
  });
});

app.get('/photo/:id', function(req,res){
  dataBaseProvider.findById(req.params.id, function(error, photo){
    res.render('photo_show.ejs',
      {locals: {
        name: photo.name,
        description: photo.description,
        full_location: photo.full_location
      }
    });
  });
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
