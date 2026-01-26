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
