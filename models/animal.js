var mongoose = require('mongoose');

var animalSchema = mongoose.Schema({
    Report : String,
    Type : String,
    Animal_name : String,
    Time : String,
    Adopted : String,
    Breed : String,
    Disabilities : String,
    Gender : String,
    Location : String,
    Prominent_Features : String,
    Upload_Image: String
});

module.exports = animalSchema;