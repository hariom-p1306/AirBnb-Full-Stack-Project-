(() => {
    'use strict'

    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const forms = document.querySelectorAll('.needs-validation')

    // Loop over them and prevent submission
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault()
                event.stopPropagation()
            }

            form.classList.add('was-validated')
        }, false)
    })
})();


// /// Booking button AJAX
// const bookBtns = document.querySelectorAll(".bookBtn");

// bookBtns.forEach(bookBtn => {
//   bookBtn.addEventListener("click", async (e) => {
//     e.preventDefault();
//     const listingId = bookBtn.dataset.id;

//     try {
//       const res = await fetch(`/bookings/${listingId}`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         credentials: "same-origin"
//       });

//       const data = await res.json();

//       if (res.ok && data.success) {
//         const bookingId = data.bookingId;

//         // Update button text
//         bookBtn.innerText = "Requested";
//         bookBtn.disabled = true;

//         // Create Proceed to Payment button
//         const payForm = document.createElement("form");
//         payForm.method = "POST";
//         payForm.action = `/bookings/${bookingId}/payment`;

//         const payBtn = document.createElement("button");
//         payBtn.className = "btn btn-primary mt-2 w-100";
//         payBtn.innerText = "Proceed to Payment";

//         payForm.appendChild(payBtn);
//         bookBtn.parentNode.appendChild(payForm);

//         alert("Booking request sent to host!");
//       } else {
//         alert("Something went wrong: " + (data.error || ""));
//       }
//     } catch (err) {
//       console.error(err);
//       alert("Error sending booking request");
//     }
//   });
// });



function initMap() {
  const location = { lat: 28.6139, lng: 77.2090 }; // Delhi (test)

  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 10,
    center: location,
  });

  new google.maps.Marker({
    position: location,
    map: map,
  });
}


  // Booking AJAX
  const bookingForm = document.getElementById("bookingForm");
  const paymentSection = document.getElementById("paymentSection");
  const paymentForm = document.getElementById("paymentForm");

  if(bookingForm) {
    bookingForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const listingId = "<%= listing._id %>";
      const checkIn = bookingForm.checkIn.value;
      const checkOut = bookingForm.checkOut.value;

      try {
        const res = await fetch(`/bookings/${listingId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ checkIn, checkOut }),
          credentials: "same-origin"
        });

        const data = await res.json();

        if(res.ok && data.success){
          alert("Booking request sent to host!");
          bookingForm.style.display = "none";

          // Show Proceed to Payment button dynamically
          paymentForm.action = `/bookings/${data.bookingId}/payment`;
          paymentSection.style.display = "block";
        } else {
          alert("Booking failed: " + (data.error || ""));
        }

      } catch(err) {
        console.error(err);
        alert("Error sending booking request");
      }
    });
  }

  // // Map initialization
  // function initMap() {
  //   const location = { lat: 28.6139, lng: 77.2090 }; // Delhi default
  //   const map = new google.maps.Map(document.getElementById("map"), { zoom: 10, center: location });
  //   new google.maps.Marker({ position: location, map: map });
  // }


