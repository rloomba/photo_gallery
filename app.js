
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , format = require('util').format
  , PhotoProvider = require('./photoprovider-mongodb').PhotoProvider;

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

var photoProvider = new PhotoProvider('localhost', 27017);

// main index get rout
app.get('/', function(req, res){
  photoProvider.findAll(function(error, photos){
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
  console.log(req.files.image.path);
  photoProvider.save({
    name: req.param('name'),
    description: req.param('description'),
    location: req.param('location')
  }, function(error, docs){
    res.redirect('/');
  });
});

app.get('/photo/:id', function(req,res){
  photoProvider.findById(req.params.id, function(error, photo){
    res.render('photo_show.ejs',
      {locals: {
        name: photo.name,
        description: photo.description,
        location: photo.location
      }
    });
  });
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
