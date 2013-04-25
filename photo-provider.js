var photoCounter = 1;

PhotoProvider = function(){};
PhotoProvider.prototype.dummyData = [];

PhotoProvider.prototype.findAll = function(callback){
  callback(null, this.dummyData);
};

PhotoProvider.prototype.findById = function(id,callback){
  var result = null;
  for(var i = 0; i < this.dummyData.length; i++){
    if(this.dummyData[i]._id == id){
      result = this.dummyData[i];
      break;
    }
  }
  callback(null, result);
};

PhotoProvider.prototype.save = function(photos, callback){
  var photo = null;

  if( typeof(photos.length) == "undefined")
    photos = [photos];

  for( var i = 0; i< photos.length; i++){
    photo = photos[i];
    photo._id = photoCounter++;
    photo.create_at = new Date();

    this.dummyData[this.dummyData.length] = photo;
  }
  callback(null, photos);
};

new PhotoProvider().save([
  {name: "name1", description: "this is a description", location: "loc1"},
  {name: "name2", description: "this a description", location: "loc2"}
  ], function(err, photos){});

exports.PhotoProvider = PhotoProvider;
