// OpenWeatherMap API key
var APIKey = "89a832b1b7cf01ef3be3b8f58fd8e668";
// city initially set to default
var city = "houston, us";
// variable to determine whether or not to add city to search history
var searchFlag = false;

var searchHistory = [];
var savedSearchString = localStorage.getItem("weatherSearchHistory");

if (savedSearchString !== null) {
  searchHistory = JSON.parse(savedSearchString);
  // initially display most recently searched city if it exists
  city = searchHistory[searchHistory.length - 1];
}

function renderSearchHistory () {
  $(".search-history").empty();
  
  // render in reverse (more recent searches towards the top)
  for (var i = 0; i < searchHistory.length; i++) {
    var searchedCity = $("<li>").prependTo(".search-history");
    searchedCity.text(searchHistory[i]);
    searchedCity.attr("class", "list-group-item");
    searchedCity.attr("id", "searched-city-" + i);  
  }
}

function renderCurrent (city) {
  var currentQueryURL = "https://api.openweathermap.org/data/2.5/weather?" +
    "units=imperial&q=" + city + 
    "&appid=" + APIKey;  
  
  $.ajax({
    url: currentQueryURL,
    method: "GET"
  })
    .done(function(response) {
      $(".current-weather").empty();

      var nameDisplay = $("<h1>").appendTo($(".current-weather"));
      nameDisplay.text(response.name + 
        " " + moment().format("(M/D/YYYY)"));
      var weatherIcon = $("<img>").appendTo(nameDisplay);
      weatherIcon.attr("src", "http://openweathermap.org/img/wn/" + 
        response.weather[0].icon + "@2x.png");
      weatherIcon.attr("alt", response.weather[0].description + 
        " weather icon");

      var currentStats = $("<div>").appendTo($(".current-weather"));
      currentStats.attr("class", "current-stats");
      
      var tempF = $("<h6>").text("Temperature: " + 
        response.main.temp + String.fromCharCode(0x00B0) + "F");
      var humidity = $("<h6>").text("Humidity: " + 
        response.main.humidity + "%");
      var windSpeed = $("<h6>").text("Wind Speed: " + 
        response.wind.speed + " MPH");
      currentStats.append(tempF, humidity, windSpeed);

      var UVIndexQueryURL = "https://api.openweathermap.org/data/2.5/uvi?" + 
      "lat=" + response.coord.lat + "&lon=" + response.coord.lon + 
      "&appid=" + APIKey;
  
      $.ajax({
        url: UVIndexQueryURL,
        method: "GET"
      })
        .then(function(response) {
          var val = response.value;
          var level = "moderate";
          if (val < 3) {
            level = "favorable";
          }
          else if (val >= 8) {
            level = "severe";
          }
          var UVIndex = $("<h6>").text("UV Index: ");
          var UVSpan = $("<span>").text(val).appendTo(UVIndex);
          UVSpan.attr("class", "uv-span " + level);
          $(".current-stats").append(UVIndex);
        });
      
      var cityCountry = response.name + ", " + response.sys.country;

      if (searchFlag) {        
        // delete repeat searches
        var searchedIndex = searchHistory.indexOf(cityCountry);
        if (searchedIndex !== -1) {
          searchHistory.splice(searchedIndex, 1);
        }
        // limit search history to 10 cities
        if (searchHistory.length > 9) {
          searchHistory.splice(0, 1);
        }
        searchHistory.push(cityCountry);
        searchHistoryString = JSON.stringify(searchHistory);
        localStorage.setItem("weatherSearchHistory", searchHistoryString);
        renderSearchHistory();  
      }
    })
    .fail(function () {
      alert(city + " is not a valid city name. Please enter a valid city!");
    });
    
}

function renderForecast (city) {
  var forecastQueryURL = "https://api.openweathermap.org/data/2.5/forecast?" +
    "units=imperial&q=" + city + 
    "&appid=" + APIKey;
  
  $.ajax({
    url: forecastQueryURL,
    method: "GET"
  })
    .then(function(response) {
      $(".forecast").empty();

      for (var i = 1; i <= 5; i++) {
        var dayIndex = (i * 8) - 1;
        var timeblock = response.list[dayIndex];
        
        var forecastDiv = $("<div>").appendTo(".forecast");
        forecastDiv.attr("class", "card forecast-card");
        var forecastDay = $("<h5>").appendTo(forecastDiv);
        forecastDay.attr("class", "card-title");
        forecastDay.text(moment.unix(timeblock.dt).format("M/D/YYYY"));

        var weatherIcon = $("<img>").appendTo(forecastDiv);
        weatherIcon.attr("src", "http://openweathermap.org/img/wn/" + 
          timeblock.weather[0].icon + "@2x.png");
        weatherIcon.attr("alt", timeblock.weather[0].description + 
          " weather icon");
  
        var forecastStats = $("<p>").appendTo(forecastDiv);
        forecastStats.attr("class", "card-text");

        var tempF = $("<h6>").text("Temperature: " + 
          timeblock.main.temp + String.fromCharCode(0x00B0) + "F");
        var humidity = $("<h6>").text("Humidity: " + 
          timeblock.main.humidity + "%");
        forecastStats.append(tempF, humidity);
      }
    });
}

$("#submit-button").on("click", function(event) {
  event.preventDefault();
  city = $("#city-input").val();
  if (city === "") {
    alert("Please enter city name!");
  }
  else if (!isNaN(Number(city))) {
    alert("Please enter text!");
  }
  else {
    searchFlag = true;
    renderCurrent(city);
    renderForecast(city);
    $("#city-input").val("");
  }
})

$(".search-history").on("click", function(event) {
  searchFlag = true;
  var searchedCity = event.target.textContent;
  renderCurrent(searchedCity);
  renderForecast(searchedCity);
})

renderCurrent(city);
renderForecast(city);
renderSearchHistory();