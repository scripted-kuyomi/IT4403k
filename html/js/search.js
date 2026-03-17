$(function () {
  $("#searchBtn").on("click", function () {
    const searchTerm = $("#searchInput").val().trim();

    if (!searchTerm) {
      $("#results").html("<p>Please enter a search term.</p>");
      return;
    }

    const $btn = $("#searchBtn");
    $btn.prop("disabled", true).text("Searching...");
    $("#results").html("<p>Loading results...</p>");

    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchTerm)}&maxResults=5`;

    $.getJSON(url, function (data) {
      let html = "";

      if (!data.items || data.items.length === 0) {
        $("#results").html("<p>No books found.</p>");
        return;
      }

      data.items.forEach(function (book) {
        const title = book.volumeInfo.title || "Untitled";
        const id = book.id;
        const thumbnail = book.volumeInfo.imageLinks
          ? book.volumeInfo.imageLinks.thumbnail
          : "";

        html += `
          <div class="book">
            ${
              thumbnail
                ? `<img src="${thumbnail}" alt="Cover for ${title}">`
                : `<div>No image available</div>`
            }
            <h3><a href="details.html?id=${id}">${title}</a></h3>
          </div>
        `;
      });

      $("#results").html(html);
    }).fail(function (xhr, status, error) {
      if (xhr.status === 429) {
        $("#results").html(`
          <p>Google Books is temporarily rate-limiting requests.</p>
          <p>Please wait a few minutes and try again.</p>
        `);
      } else {
        $("#results").html(`
          <p>Could not load results.</p>
          <p>Status: ${status}</p>
          <p>HTTP code: ${xhr.status}</p>
          <p>Error: ${error}</p>
        `);
      }
    }).always(function () {
      $btn.prop("disabled", false).text("Search");
    });
  });
});