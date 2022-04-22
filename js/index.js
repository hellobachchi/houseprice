$(window, document, undefined).ready(function () {
  $("input").blur(function () {
    var $this = $(this);
    if ($this.val()) $this.addClass("used");
    else $this.removeClass("used");
  });

  var $ripples = $(".ripples");

  $ripples.on("click.Ripples", function (e) {
    var $this = $(this);
    var $offset = $this.parent().offset();
    var $circle = $this.find(".ripplesCircle");

    var x = e.pageX - $offset.left;
    var y = e.pageY - $offset.top;

    $circle.css({
      top: y + "px",
      left: x + "px",
    });

    $this.addClass("is-active");
  });

  $ripples.on(
    "animationend webkitAnimationEnd mozAnimationEnd oanimationend MSAnimationEnd",
    function (e) {
      $(this).removeClass("is-active");
    }
  );
});

var city_element = document.getElementById("city");
var district_element = document.getElementById("district");
var options;
var bed_element = document.getElementById("bed");
var housesize_element = document.getElementById("housesize");
var landsize_element = document.getElementById("landsize");
var bath_element = document.getElementById("bath");
var price_element = document.getElementById("price");
var submit_button = document.getElementById("submit");
var locations_dict = {};
function predict() {
  var xmlhttp = new XMLHttpRequest();

  city = city_element.value;
  district = district_element.value;
  house_size = housesize_element.value;
  land_size = landsize_element.value;
  baths = bath_element.value;
  beds = bed_element.value;
  if (
    city == "" ||
    district == "" ||
    house_size == "" ||
    land_size == "" ||
    baths == "" ||
    beds == ""  
  ){
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: 'Please fill all the fields!',
    })
  return}
  Swal.showLoading()

  xmlhttp.open("POST", `https://srilankanhousepricepredictor.herokuapp.com/predict`, true);
  xmlhttp.setRequestHeader("Content-type", "application/json");
  xmlhttp.send(
    `{"house_size":"${house_size}","land_size":"${land_size}","baths":"${baths}","beds":"${beds}","city":"${city}","district":"${district}"}`
  );
  xmlhttp.onreadystatechange = () => {
    
    if (xmlhttp.readyState == 4) {
    
      
      Swal.close();
      var price = parseFloat(xmlhttp.responseText).toFixed(2);
      var formatter = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "LKR",

        // These options are needed to round to whole numbers if that's what you want.
        //minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
        //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
      });

      if (city == "other") {
        city = "";
      } else {
        city = city + " , ";
      }

      Swal.fire({
        title: "You may cost ",
        text: formatter.format(price) + " in " + city + district + ".",
      });
    }
  };
}

function getLocations() {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET", `https://srilankanhousepricepredictor.herokuapp.com/getLocations`, true);
  xmlhttp.send();
  xmlhttp.onreadystatechange = () => {
    if (xmlhttp.readyState == 4) {
      locations = JSON.parse(xmlhttp.responseText);
      locations_dict = locations;
      var options = "<option value=''>Select a District</option>";
      for (var district in locations) {
        options += ` 
          <option>${district}</option>  `;
      }
      district_element.innerHTML = options;
    }
  };
}
getLocations();
submit_button.addEventListener("click", predict);

function set_Cities() {
  var options = "<option value=''>Select a City</option>";
  var district = district_element.value;
  if (district in locations_dict) {
    var city_options = locations_dict[district];
    city_options.forEach((element) => {
      if (city_options.length == 1 && element.toLowerCase().trim() == "other") {
        options += ` 
        <option value="${element}">${district} City</option>  `;
      } else if (element.toLowerCase().trim() != "other")
        options += `<option value="${element}">${element}</option>  `;
    });
    if (city_options.length != 1 && city_options.includes("other"))
      options += "<option value='other'>Other</option>";
    city_element.innerHTML = options;
    city_element.disabled = false;
  }
}

district_element.addEventListener("change", set_Cities);
