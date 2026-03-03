$(function() {
    const jsonPath = "../js/data/weather.json";


$.getJSON(jsonPath, function(data){
   //{city:{name, country} , weather:{description,temperature,feels_like,humidity,wind_speed} }

   const isSimpleFormat = data && data.city && data.weather;

   const cityName= isSimpleFormat ? data.city.name : (data.name || "Unknown City");
   const country = isSimpleFormat ? (data.city.country || "") : ((data.sys && data.sys.country) || "");

   const description = isSimpleFormat
   ?(data.weather.description || "N/A")
   : (Array.isArray(data.weather) && data.weather[0] && data.weather[0].description) || "N/A";

   const temp = isSimpleFormat
   ? data.weather.temperature
   : (data.main && data.main.temp);

   const feelsLike = isSimpleFormat
   ? data.weather.feels_like
   : (data.main && data.main.feels_like);

   const humidity = isSimpleFormat
   ? data.weather.humidity
   : (data.main && data.main.humidity);

    const windSpeed = isSimpleFormat
    ? data.weather.wind_speed
    : (data.wind && data.wind.speed);

    function fmtNumber(val, suffix = "") {
        return (val === 0 || (typeof val === "number" && Number.isFinite(val)))
        ? `${val}${suffix}`
        : "N/A";
    }

    const locationText = country ? `${cityName}, ${country}` : cityName;

    $("#weatherOut").html(`
        <h2 style="margin-top:0;">${locationText}</h2>
        <p class="meta" style="margin-top:0; text-transform: capitalize;">
        ${description}
        </p>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 12px;">
         <div class= "card" style="padding: 12px;">
          <strong>Temperature</strong>
          <div style="font-size:1.2rem; margin-top:6px;">
          ${fmtNumber(temp,  "°")}
          </div>
     </div>

        <div class="card" style="padding: 12px;">
        <strong>Feels like</strong>
        <div style="font-size:1.2rem; margin-top:6px;">
        ${fmtNumber(feelsLike, "°")}
        </div>
        </div>

        <div class="card" style="padding: 12px;">
        <strong>Humidity</strong>
        <div style="font-size:1.2rem; margin-top:6px;">
        ${fmtNumber(humidity, "%")}
        </div>
        </div>

        <div class="card" style="padding: 12px;">
        <strong>Wind Speed</strong>
        <div style="font-size:1.2rem; margin-top:6px;">
        ${fmtNumber(windSpeed, " mph")}
        </div>
        </div>
        </div>
    `);
}).fail(function(xhr) {
    $("#weatherOut").html(`
        <p class="error">Could not load weather.json.</p>
        <p class="meta"> Check the file path.</p>
        <p class="meta"> Tried to load: <code>${jsonPath}</code>(HTTP ${xhr.status})</p>
        `);
});
});