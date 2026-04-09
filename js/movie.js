$(function(){
    $.getJSON("js/data/data-movie.json", function(data){

        const actorsList = Array.isArray(data.actors)
        ? data.actors.join(", ")
        : data.actors;

        $("#movieOutput").html(`
            <div class="movie-layout">
            <img src="${data.poster}" alt="Poster for ${data.title}" class="movie-poster">

            <div class="movie-details">
            <h2>${data.title}</h2>
            <p><strong>Year:</strong> ${data.year}</p>
            <p><strong>Genre:</strong> ${data.genre}</p>
            <p><strong>Director:</strong> ${data.director}</p>
            <p><strong>Actors:</strong> ${actorsList}</p>
            <p><strong>Plot:</strong> ${data.plot}</p>
            <p><strong>Rating:</strong> ${data.rating}</p>
            </div>
        </div>
        `);
    })
    .fail(function(){
        $("#movieOutput").text("Could not load movie.json. Check file path");
    });
});