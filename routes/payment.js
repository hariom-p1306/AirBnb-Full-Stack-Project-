const express = require("express");
const router = express.Router();

const Booking = require("../models/booking");
const { isLoggedIn } = require("../middleware");

// ================= PAYMENT PAGE =================
router.get("/:bookingId", isLoggedIn, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId)
      .populate("listing")
      .populate("guest")
      .populate("host");

    if (!booking) {
      req.flash("error", "Booking not found");
      return res.redirect("/bookings/my");
    }

    if (!booking.guest._id.equals(req.user._id)) {
      req.flash("error", "You are not authorized to pay for this booking");
      return res.redirect("/bookings/my");
    }

    if (booking.status === "rejected") {
      req.flash("error", "Rejected booking cannot be paid");
      return res.redirect("/bookings/my");
    }

    if (booking.paymentStatus === "paid") {
      req.flash("success", "Payment already completed");
      return res.redirect(`/payment/${booking._id}/success`);
    }

    res.render("bookings/payment", { booking });
  } catch (err) {
    console.log("Payment page error:", err);
    req.flash("error", "Something went wrong while opening payment page");
    res.redirect("/bookings/my");
  }
});

// ================= DUMMY PAYMENT SUCCESS =================
router.post("/:bookingId", isLoggedIn, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId)
      .populate("guest")
      .populate("listing")
      .populate("host");

    if (!booking) {
      req.flash("error", "Booking not found");
      return res.redirect("/bookings/my");
    }

    if (!booking.guest._id.equals(req.user._id)) {
      req.flash("error", "You are not authorized to pay for this booking");
      return res.redirect("/bookings/my");
    }

    if (booking.status === "rejected") {
      req.flash("error", "Rejected booking cannot be paid");
      return res.redirect("/bookings/my");
    }

    booking.status = "accepted";
    booking.paymentStatus = "paid";

    await booking.save();

    req.flash("success", "Payment successful 🎉 Booking confirmed");
    res.redirect(`/payment/${booking._id}/success`);
  } catch (err) {
    console.log("Payment success error:", err);
    req.flash("error", "Payment failed. Please try again.");
    res.redirect("/bookings/my");
  }
});

// ================= PAYMENT SUCCESS / RECEIPT PAGE =================
router.get("/:bookingId/success", isLoggedIn, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId)
      .populate("listing")
      .populate("guest")
      .populate("host");

    if (!booking) {
      req.flash("error", "Booking not found");
      return res.redirect("/bookings/my");
    }

    if (!booking.guest._id.equals(req.user._id)) {
      req.flash("error", "You are not authorized to view this receipt");
      return res.redirect("/bookings/my");
    }

    if (booking.paymentStatus !== "paid") {
      req.flash("error", "Payment is not completed yet");
      return res.redirect("/bookings/my");
    }

    res.render("bookings/paymentSuccess", { booking });
  } catch (err) {
    console.log("Payment receipt error:", err);
    req.flash("error", "Something went wrong while opening receipt");
    res.redirect("/bookings/my");
  }
});

module.exports = router;