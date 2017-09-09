const mongoose   = require('mongoose');
const Schema     = mongoose.Schema;

let houseSchema = new Schema({
  price: {
    type    : Number,
    required: true
  },
  latitude  : {
    type   : Number
  },
  longitude  : {
    type   : Number
  }
});

module.exports = mongoose.model('houses', houseSchema);