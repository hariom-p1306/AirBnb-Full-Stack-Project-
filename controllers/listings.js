// const Listing = require("../models/listing");
// module.exports.index = async (req, res) => {
//   const { category } = req.query;

//   let allListings;

//   if (category) {
//     allListings = await Listing.find({ category });
//   } else {
//     allListings = await Listing.find({});
//   }

//   res.render("listings/index", { allListings,category });
// };



const Listing = require("../models/listing");
const Booking = require("../models/booking");

module.exports.index = async (req, res) => {
  const {
    category,
    q,
    minPrice,
    maxPrice,
    sort
  } = req.query;

  let filter = {};
  let sortOption = {};

  // ================= CATEGORY FILTER =================
  if (category && category !== "All") {
    filter.category = category;
  }

  // ================= SEARCH FILTER =================
  if (q && q.trim() !== "") {
    const searchText = q.trim();

    filter.$or = [
      { title: { $regex: searchText, $options: "i" } },
      { location: { $regex: searchText, $options: "i" } },
      { country: { $regex: searchText, $options: "i" } },
    ];
  }

  // ================= PRICE FILTER =================
  if (minPrice || maxPrice) {
    filter.price = {};

    if (minPrice && !isNaN(minPrice)) {
      filter.price.$gte = Number(minPrice);
    }

    if (maxPrice && !isNaN(maxPrice)) {
      filter.price.$lte = Number(maxPrice);
    }
  }

  // ================= SORTING =================
  if (sort === "price_asc") {
    sortOption.price = 1;
  } else if (sort === "price_desc") {
    sortOption.price = -1;
  } else {
    sortOption.createdAt = -1;
  }

  const allListings = await Listing.find(filter)
    .populate("reviews")
    .sort(sortOption);

  // ================= AVERAGE RATING =================
  allListings.forEach((listing) => {
    if (listing.reviews && listing.reviews.length > 0) {
      let total = 0;

      listing.reviews.forEach((review) => {
        total += review.rating;
      });

      listing.avgRating = (total / listing.reviews.length).toFixed(1);
    } else {
      listing.avgRating = "New";
    }
  });

  res.render("listings/index", {
    allListings,
    category,
    q,
    minPrice,
    maxPrice,
    sort,
  });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};



module.exports.showListing = async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing you requested does not exist!");
    return res.redirect("/listings");
  }

  // Find users who completed paid bookings for this listing
  const paidBookings = await Booking.find({
    listing: id,
    paymentStatus: "paid",
  }).select("guest");

  const verifiedGuests = paidBookings.map((booking) =>
    booking.guest.toString()
  );
  const unavailableBookings = await Booking.find({
  listing: id,
  status: "accepted",
  paymentStatus: "paid",
}).select("checkIn checkOut");

  res.render("listings/show.ejs", {
  listing,
  verifiedGuests,
  unavailableBookings,
});
};







module.exports.createListing = async (req, res, next) => {

  const newListing = new Listing(req.body.listing);
  console.log("BODY 👉", req.body.listing);
  newListing.owner = req.user._id;

  let url = req.file.path;
  let filename = req.file.filename;
  console.log(url, "..", filename);
  
  //newListing.owner = req.Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };
  await newListing.save();
  req.flash("success", "New Listing Created!");
  res.redirect("/listings");
}

module.exports.myListings = async (req, res) => {
  const listings = await Listing.find({ owner: req.user._id })
    .populate("reviews")
    .sort({ createdAt: -1 });

  listings.forEach((listing) => {
    if (listing.reviews && listing.reviews.length > 0) {
      let total = 0;

      listing.reviews.forEach((review) => {
        total += review.rating;
      });

      listing.avgRating = (total / listing.reviews.length).toFixed(1);
    } else {
      listing.avgRating = "New";
    }
  });

  res.render("listings/myListings", { listings });
};


module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exits!");
    res.redirect("/listings");
  }

  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/uplaod", "/upload/w_250,h_250");
  res.render("listings/edit", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true, runValidators: true });

  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }
  req.flash("success", " Listing Updated! ");
  res.redirect(`/listings/${id}`);
};



module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;

  // delete all bookings related to this listing
  await Booking.deleteMany({ listing: id });

  // delete the listing
  await Listing.findByIdAndDelete(id);

  req.flash("success", "Listing deleted successfully!");
  res.redirect("/listings");
};