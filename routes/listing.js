
const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const Reviews = require("../models/review.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");

const listeningController = require("../controllers/listings.js");
//const listngController = require("../controllers/listings.js");

const multer = require('multer');
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

router
  .route("/")
  .get(wrapAsync(listeningController.index))
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listeningController.createListing)
  );

// New route
router.get(
  "/new",
  isLoggedIn,
  listeningController.renderNewForm
);

router
  .route("/:id")
  .get(wrapAsync(listeningController.showListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listeningController.updateListing)
  )
  .delete(
    isLoggedIn,
    isOwner,
    wrapAsync(listeningController.destroyListing)
  );

// Edit route
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listeningController.renderEditForm)
);



// router.get("/search", wrapAsync(async (req, res) => {
//     const { q } = req.query;

//     if (!q) {
//         return res.redirect("/listings");
//     }

//     const listings = await Listing.find({
//         $or: [
//             { location: { $regex: q, $options: "i" } },
//             { country: { $regex: q, $options: "i" } },
//             { title: { $regex: q, $options: "i" } }
//         ]
//     });

//     res.render("listings/index", { listings });
// }));





module.exports = router;





