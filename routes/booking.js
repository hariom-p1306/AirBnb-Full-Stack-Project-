const express = require("express");
const router = express.Router();
const Booking = require("../models/booking");
const Listing = require("../models/listing");
const { isLoggedIn } = require("../middleware");



// ================= HOST DASHBOARD =================
// router.get("/host/dashboard", isLoggedIn, async (req, res) => {
//     const bookings = await Booking.find({ host: req.user._id })
//         .populate("listing")
//         .populate("guest");
//     //console.log("HOST ID SAVED:", booking.host.toString());
//     // console.log("CURRENT USER:", req.user._id.toString());


//     res.render("bookings/dashboard", { bookings });
// });


// ================= HOST DASHBOARD =================
// ================= HOST DASHBOARD =================
router.get("/host/dashboard", isLoggedIn, async (req, res) => {
  const hostId = req.user._id;
  const { status } = req.query;

  let bookingFilter = {
    host: hostId,
  };

  if (status && status !== "all") {
    if (status === "paid") {
      bookingFilter.paymentStatus = "paid";
    } else {
      bookingFilter.status = status;
    }
  }

  const bookings = await Booking.find(bookingFilter)
    .populate({
      path: "listing",
      select: "title image price location country",
    })
    .populate({
      path: "guest",
      select: "username email",
    })
    .sort({ createdAt: -1 });

  const allHostBookings = await Booking.find({ host: hostId }).populate("listing");

  const totalListings = await Listing.countDocuments({ owner: hostId });

  const totalRequests = allHostBookings.length;

  const pendingRequests = allHostBookings.filter(
    (booking) => booking.status === "pending"
  ).length;

  const acceptedBookings = allHostBookings.filter(
    (booking) => booking.status === "accepted"
  ).length;

  const rejectedBookings = allHostBookings.filter(
    (booking) => booking.status === "rejected"
  ).length;

  const estimatedRevenue = allHostBookings
    .filter(
      (booking) =>
        booking.status === "accepted" && booking.paymentStatus === "paid"
    )
    .reduce((total, booking) => {
      return total + Number(booking.totalPrice || 0);
    }, 0);

  const stats = {
    totalListings,
    totalRequests,
    pendingRequests,
    acceptedBookings,
    rejectedBookings,
    estimatedRevenue,
  };

  res.render("bookings/dashboard", {
    bookings,
    stats,
    status: status || "all",
  });
});

// ================= GUEST DASHBOARD =================
router.get("/my", isLoggedIn, async (req, res) => {
    const bookings = await Booking.find({ guest: req.user._id })
        .populate("listing")
        .populate("host");

    res.render("bookings/my", { bookings });
});




// ================= ACCEPT =================
// ================= ACCEPT =================
router.post("/:bookingId/accept", isLoggedIn, async (req, res) => {
    const booking = await Booking.findById(req.params.bookingId);

    if (!booking) {
        req.flash("error", "Booking not found");
        return res.redirect("/bookings/host/dashboard");
    }

    if (!booking.host.equals(req.user._id)) {
        req.flash("error", "You are not authorized to accept this booking");
        return res.redirect("/bookings/host/dashboard");
    }

    // Check if another accepted booking already exists for same listing + overlapping dates
    const conflictBooking = await Booking.findOne({
        _id: { $ne: booking._id },
        listing: booking.listing,
        status: "accepted",
        checkIn: { $lt: booking.checkOut },
        checkOut: { $gt: booking.checkIn },
    });

    if (conflictBooking) {
        booking.status = "rejected";
        await booking.save();

        req.flash(
            "error",
            "This booking conflicts with an already accepted booking."
        );

        return res.redirect("/bookings/host/dashboard");
    }

    // Accept selected booking
    booking.status = "accepted";
    await booking.save();

    // Auto-reject other pending conflicting bookings
    await Booking.updateMany(
        {
            _id: { $ne: booking._id },
            listing: booking.listing,
            status: "pending",
            checkIn: { $lt: booking.checkOut },
            checkOut: { $gt: booking.checkIn },
        },
        {
            $set: {
                status: "rejected",
            },
        }
    );

    req.flash(
        "success",
        "Booking accepted. Conflicting pending bookings were automatically rejected."
    );

    res.redirect("/bookings/host/dashboard");
});


// ================= REJECT =================

router.post("/:bookingId/reject", isLoggedIn, async (req, res) => {
    const booking = await Booking.findById(req.params.bookingId);

    if (!booking) {
        req.flash("error", "Booking not found");
        return res.redirect("/bookings/host/dashboard");
    }

    if (!booking.host.equals(req.user._id)) {
        req.flash("error", "You are not authorized to reject this booking");
        return res.redirect("/bookings/host/dashboard");
    }

    booking.status = "rejected";
    await booking.save();

    req.flash("error", "Booking rejected");
    res.redirect("/bookings/host/dashboard");
});

// ================= CANCEL BOOKING BY GUEST =================
router.post("/:bookingId/cancel", isLoggedIn, async (req, res) => {
    const booking = await Booking.findById(req.params.bookingId);

    if (!booking) {
        req.flash("error", "Booking not found");
        return res.redirect("/bookings/my");
    }

    if (!booking.guest.equals(req.user._id)) {
        req.flash("error", "You are not authorized to cancel this booking");
        return res.redirect("/bookings/my");
    }

    if (booking.status !== "pending") {
        req.flash("error", "Only pending bookings can be cancelled");
        return res.redirect("/bookings/my");
    }

    await Booking.findByIdAndDelete(req.params.bookingId);

    req.flash("success", "Booking request cancelled successfully");
    res.redirect("/bookings/my");
});



// ================= CREATE BOOKING (LAST ME) =================
// ================= CREATE BOOKING (LAST ME) =================
router.post("/:id", isLoggedIn, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate("owner");

    if (!listing || !listing.owner) {
      return res.status(404).json({
        success: false,
        error: "Listing or owner not found",
      });
    }

    const { checkIn, checkOut } = req.body;

    if (!checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        error: "Please select check-in and check-out dates.",
      });
    }

    const newCheckIn = new Date(checkIn);
    const newCheckOut = new Date(checkOut);

    if (isNaN(newCheckIn.getTime()) || isNaN(newCheckOut.getTime())) {
      return res.status(400).json({
        success: false,
        error: "Invalid booking dates.",
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (newCheckIn < today) {
      return res.status(400).json({
        success: false,
        error: "Check-in date cannot be in the past.",
      });
    }

    if (newCheckOut <= newCheckIn) {
      return res.status(400).json({
        success: false,
        error: "Check-out date must be after check-in date.",
      });
    }

    if (listing.owner._id.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        error: "You cannot book your own listing.",
      });
    }

    // Only accepted bookings block new booking
    const existingBooking = await Booking.findOne({
      listing: listing._id,
      status: "accepted",
      checkIn: { $lt: newCheckOut },
      checkOut: { $gt: newCheckIn },
    });

    if (existingBooking) {
      return res.status(409).json({
        success: false,
        error: "This listing is already booked for selected dates.",
      });
    }

    // Total nights and price calculation
    const oneDay = 24 * 60 * 60 * 1000;
    const totalNights = Math.ceil((newCheckOut - newCheckIn) / oneDay);
    const totalPrice = totalNights * Number(listing.price || 0);

    const booking = new Booking({
      listing: listing._id,
      guest: req.user._id,
      host: listing.owner._id,
      checkIn: newCheckIn,
      checkOut: newCheckOut,
      status: "pending",
      paymentStatus: "unpaid",
      totalNights,
      totalPrice,
    });

    await booking.save();

    return res.json({
      success: true,
      bookingId: booking._id,
      message: "Booking request sent successfully.",
    });
  } catch (err) {
    console.log("Booking error:", err);

    return res.status(500).json({
      success: false,
      error: "Booking failed. Please try again.",
    });
  }
});

module.exports = router;
