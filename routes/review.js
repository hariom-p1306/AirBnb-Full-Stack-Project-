const express = require("express");
const router = express.Router({ mergeParams: true });

const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const {validateReview,isLoggedIn,isReviewAuthor} = require("../middleware.js");
const { createReview } = require("../controllers/review.js");
const reviewController = require("../controllers/review.js")

// Add review


router.post("/", isLoggedIn, validateReview, wrapAsync(reviewController.createReview));

// router.post("/", (req, res) => {
//   console.log("REVIEW ROUTE HIT ", req.params.id);
//   console.log(req.body);
//   res.send("OK REVIEW");
// });



// Delete review
router.delete("/:reviewId",isLoggedIn, wrapAsync(reviewController.destroyReview));

module.exports = router;