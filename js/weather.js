$(function(){
    $.getJSON("data/weather.json", function(data){
        $("weatherOutput").html(`
            <h2>${data.city}</h2>
            <p><strong>Temp:</strong>${data.temperature}</p>
            `);
    });
})