// ================= BOOTSTRAP FORM VALIDATION =================

(() => {
  "use strict";

  const forms = document.querySelectorAll(".needs-validation");

  Array.from(forms).forEach((form) => {
    form.addEventListener(
      "submit",
      (event) => {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }

        form.classList.add("was-validated");
      },
      false
    );
  });
})();


// ================= GOOGLE MAP =================

function initMap() {
  const mapElement = document.getElementById("map");

  // Prevent error on pages where map does not exist
  if (!mapElement) return;

  // Default location: Delhi
  const location = {
    lat: 28.6139,
    lng: 77.2090,
  };

  const map = new google.maps.Map(mapElement, {
    zoom: 10,
    center: location,
  });

  new google.maps.Marker({
    position: location,
    map: map,
  });
}


// ================= BOOKING AJAX =================

const bookingForm = document.getElementById("bookingForm");
const paymentSection = document.getElementById("paymentSection");
const paymentLink = document.getElementById("paymentLink");

if (bookingForm) {
  bookingForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const listingId = bookingForm.dataset.listingId;
    const checkIn = bookingForm.checkIn.value;
    const checkOut = bookingForm.checkOut.value;

    if (!listingId) {
      alert("Listing not found.");
      return;
    }

    if (!checkIn || !checkOut) {
      alert("Please select check-in and check-out dates.");
      return;
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkOutDate <= checkInDate) {
      alert("Check-out date must be after check-in date.");
      return;
    }

    try {
      const res = await fetch(`/bookings/${listingId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          checkIn,
          checkOut,
        }),
        credentials: "same-origin",
      });

      const data = await res.json();

      if (res.ok && data.success) {
        alert("Booking request sent to host!");

        bookingForm.style.display = "none";

        if (paymentLink && paymentSection) {
          paymentLink.href = `/payment/${data.bookingId}`;
          paymentSection.style.display = "block";
        }

        return;
      }

      alert(data.error || "Booking failed. Please try again.");
    } catch (err) {
      console.error(err);
      alert("Error sending booking request. Please try again.");
    }
  });
}

// ================= IMAGE UPLOAD PREVIEW =================

const imageInput = document.querySelector('input[name="listing[image]"]');
const imagePreviewBox = document.getElementById("imagePreviewBox");
const imagePreview = document.getElementById("imagePreview");

if (imageInput && imagePreviewBox && imagePreview) {
  imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];

    if (!file) {
      imagePreviewBox.classList.add("d-none");
      imagePreview.src = "";
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      imageInput.value = "";
      imagePreviewBox.classList.add("d-none");
      imagePreview.src = "";
      return;
    }

    const imageUrl = URL.createObjectURL(file);

    imagePreview.src = imageUrl;
    imagePreviewBox.classList.remove("d-none");
  });
}