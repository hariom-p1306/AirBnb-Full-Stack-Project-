const mongoose = require("mongoose");
const logiCal = require("./data.js");
const Listing = require("../models/listing.js");


main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}

const workOn = async () => {
  await Listing.deleteMany({});
  logiCal.data = logiCal.data.map((obj)=>({...obj,owner:'68f7271ac5f082d13705d683'}));
  await Listing.insertMany(logiCal.data); 

  console.log("data was initialized");
};

workOn();




