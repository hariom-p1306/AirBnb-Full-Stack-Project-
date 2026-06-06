const express = require("express");
const router = express.Router();

const User = require("../models/user");
const Listing = require("../models/listing");
const { isLoggedIn } = require("../middleware");

// ================= TOGGLE WISHLIST =================
// Add/remove listing from wishlist
router.post("/:listingId", isLoggedIn, async (req, res) => {
  try {
    const { listingId } = req.params;

    const listing = await Listing.findById(listingId);

    if (!listing) {
      return res.status(404).json({
        success: false,
        error: "Listing not found",
      });
    }

    const user = await User.findById(req.user._id);

    const alreadySaved = user.wishlist.some(
      (id) => id.toString() === listingId
    );

    if (alreadySaved) {
      user.wishlist = user.wishlist.filter(
        (id) => id.toString() !== listingId
      );

      await user.save();

      return res.json({
        success: true,
        saved: false,
        message: "Removed from wishlist",
      });
    }

    user.wishlist.push(listingId);
    await user.save();

    return res.json({
      success: true,
      saved: true,
      message: "Added to wishlist",
    });
  } catch (err) {
    console.log("Wishlist error:", err);

    return res.status(500).json({
      success: false,
      error: "Wishlist update failed",
    });
  }
});

// ================= SHOW WISHLIST PAGE =================
router.get("/", isLoggedIn, async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: "wishlist",
    populate: {
      path: "reviews",
    },
  });

  const wishlistListings = user.wishlist;

  wishlistListings.forEach((listing) => {
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

  res.render("wishlist/index", { wishlistListings });
});

module.exports = router;