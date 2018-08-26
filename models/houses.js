const mongoose   = require('mongoose');
const Schema     = mongoose.Schema;

let houseSchema = new Schema({
  location:{
    type    : String,
  },
  bathroom_number:{
    type    : Number,
  },
  bedroom_number:{
    type    : Number,
  },
  car_spaces:{
    type    : Number,
  },
  commission:{
    type    : Number,
  },
  construction_year:{
    type    : Number,
  },
  datasource_name:{
    type    : String,
  },
  floor:{
    type    : Number,
  },
  img_height:{
    type    : Number,
  },
  img_url:{
    type    : String,
  },
  img_width:{
    type    : Number,
  },
  keywords:{
    type    : String,
  },
  latitude:{
    type    : Number,
  },
  lister_name:{
    type    : String,
  },
  lister_url:{
    type    : String,
  },
  listing_type:{
    type    : String,
  },
  location_accuracy:{
    type    : Number,
  },
  longitude:{
    type    : Number,
  },
  price:{
    type    : Number,
  },
  price_currency:{
    type    : String,
  },
  price_formatted:{
    type    : String,
  },
  price_high:{
    type    : Number,
  },
  price_low:{
    type    : Number,
  },
  property_type:{
    type    : String,
  },
  room_number:{
    type    : Number,
  },
  size:{
    type    : Number,
  },
  size_type:{
    type    : String,
  },
  summary:{
    type    : String,
  },
  thumb_height:{
    type    : Number,
  },
  thumb_url:{
    type    : String,
  },
  thumb_width:{
    type    : Number,
  },
  title:{
    type    : String,
  },
  updated_in_days:{
    type    : Number,
  },
  updated_in_days_formatted:{
    type    : String,
  },
});




module.exports = mongoose.model('houses', houseSchema);