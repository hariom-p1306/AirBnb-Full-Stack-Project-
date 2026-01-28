const express = require("express");
const router = express.Router();
const Booking = require("../models/booking");
const Listing = require("../models/listing");
const { isLoggedIn } = require("../middleware");


// ================= HOST DASHBOARD =================
router.get("/host/dashboard", isLoggedIn, async (req, res) => {
    const bookings = await Booking.find({ host: req.user._id })
        .populate("listing")
        .populate("guest");
    //console.log("HOST ID SAVED:", booking.host.toString());
    // console.log("CURRENT USER:", req.user._id.toString());


    res.render("bookings/dashboard", { bookings });
});

// ================= GUEST DASHBOARD =================
router.get("/my", isLoggedIn, async (req, res) => {
    const bookings = await Booking.find({ guest: req.user._id })
        .populate("listing")
        .populate("host");

    res.render("bookings/my", { bookings });
});



// ================= ACCEPT =================
router.post("/:bookingId/accept", isLoggedIn, async (req, res) => {
    await Booking.findByIdAndUpdate(req.params.bookingId, {
        status: "accepted"
    });

    req.flash("success", "Booking accepted");
    res.redirect("/bookings/host/dashboard");
});


// ================= REJECT =================
router.post("/:bookingId/reject", isLoggedIn, async (req, res) => {
    await Booking.findByIdAndUpdate(req.params.bookingId, {
        status: "rejected"
    });

    req.flash("error", "Booking rejected");
    res.redirect("/bookings/host/dashboard");
});


// ================= CREATE BOOKING (LAST ME) =================
router.post("/:id", isLoggedIn, async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id).populate("owner");

        if (!listing || !listing.owner) {
            return res.status(404).json({ success: false, error: "Listing or owner not found" });
        }

        const { checkIn, checkOut } = req.body;

        const booking = new Booking({
            listing: listing._id,
            guest: req.user._id,
            host: listing.owner._id,
            checkIn,
            checkOut,
            status: "pending"
        });

        await booking.save();

        // JSON response for AJAX
        res.json({ success: true, bookingId: booking._id });
    } catch (err) {
        console.log("Booking error:", err);
        res.status(500).json({ success: false, error: "Booking failed" });
    }
});





module.exports = router;
