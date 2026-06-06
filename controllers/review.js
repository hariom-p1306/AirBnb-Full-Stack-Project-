const Listing = require("../models/listing");
const Review = require("../models/review");
const Booking = require("../models/booking");

// ================= CREATE REVIEW =================
module.exports.createReview = async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }

  // Check paid booking
  const paidBooking = await Booking.findOne({
    listing: id,
    guest: req.user._id,
    paymentStatus: "paid",
  });

  if (!paidBooking) {
    req.flash(
      "error",
      "You can review this listing only after completing a paid booking."
    );
    return res.redirect(`/listings/${id}`);
  }

  // Prevent duplicate review
  const existingReview = await Review.findOne({
    listing: id,
    author: req.user._id,
  });

  if (existingReview) {
    req.flash("error", "You have already reviewed this listing.");
    return res.redirect(`/listings/${id}`);
  }

  const newReview = new Review(req.body.review);

  newReview.author = req.user._id;
  newReview.listing = listing._id;

  listing.reviews.push(newReview);

  await newReview.save();
  await listing.save();

  req.flash("success", "Review added successfully!");
  res.redirect(`/listings/${id}`);
};

// ================= DELETE REVIEW =================
module.exports.destroyReview = async (req, res) => {
  const { id, reviewId } = req.params;

  await Listing.findByIdAndUpdate(id, {
    $pull: {
      reviews: reviewId,
    },
  });

  await Review.findByIdAndDelete(reviewId);

  req.flash("success", "Review deleted successfully!");
  res.redirect(`/listings/${id}`);
};