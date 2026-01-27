const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    image: {
        
        url:String,
        filename:String,
        // url:{
        // type: String,
        // default:
        // "https://images.pexels.com/photos/414612/pexels-photo-414612.jpeg?cs=srgb&dl=pexels-souvenirpixels-414612.jpg&fm=jpg",
        

    },
   price: {
  type: Number,
  default: 0
},
    location: [String],
    country: String,

     owner:
        {
        type: Schema.Types.ObjectId,
        ref:"User",
        },
    reviews:[
        {
        type: Schema.Types.ObjectId,
        ref:"Review",
        },
    ],

    category: {
    type: String,
    required: true,
    enum: [
      "Trending",
      "Rooms",
      "Iconic Cities",
      "Mountain",
      "Amazing Pools",
      "Camping",
      "Farms",
      "Boats"
    ]
    
  },

 owner: {  // <-- YE ZARURI HAI
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  reviews: [
    { type: Schema.Types.ObjectId, ref: "Review" }
  ]


 
});

listingSchema.post("findOneAndDelete", async(listing) =>{
    if(listing){
        await Review.deleteMany({_id : {$in : listing.reviews}});

    }
});
const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;



