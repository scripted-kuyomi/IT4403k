$(function () {
  let currentSearchTerm = "";
  let currentPage = 1;
  const resultsPerPage = 10;
  const maxPages = 6;

  const fallbackSearchBooks = [
    {
      id: "8kwoEQAAQBAJ",
      title: "Jujutsu Kaisen",
      authors: ["Gege Akutami"],
      thumbnail: ""
    }
  ];

  buildPageDropdown();

  $("#searchBtn").on("click", function () {
    const searchTerm = $("#searchInput").val().trim();

    if (!searchTerm) {
      $("#results").html("<p>Please enter a search term.</p>");
      return;
    }

    currentSearchTerm = searchTerm;
    currentPage = 1;
    $("#pageSelect").val("1");

    loadSearchResults();
  });

  $("#pageSelect").on("change", function () {
    currentPage = parseInt($(this).val(), 10);

    if (!currentSearchTerm) {
      $("#results").html("<p>Please search for a book first.</p>");
      return;
    }

    loadSearchResults();
  });

  function buildPageDropdown() {
    let options = "";

    for (let i = 1; i <= maxPages; i++) {
      options += `<option value="${i}">Page ${i}</option>`;
    }

    $("#pageSelect").html(options);
  }

  function loadSearchResults() {
    const $btn = $("#searchBtn");
    $btn.prop("disabled", true).text("Searching...");
    $("#results").html("<p>Loading results...</p>");

    const startIndex = (currentPage - 1) * resultsPerPage;
    const cacheKey = `search_${currentSearchTerm.toLowerCase()}_${currentPage}`;
    const cached = sessionStorage.getItem(cacheKey);

    if (cached) {
      renderSearchResults(JSON.parse(cached));
      $btn.prop("disabled", false).text("Search");
      return;
    }

    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(currentSearchTerm)}&maxResults=${resultsPerPage}&startIndex=${startIndex}`;

    $.getJSON(url, function (data) {
      sessionStorage.setItem(cacheKey, JSON.stringify(data));
      renderSearchResults(data);
    }).fail(function (xhr, status, error) {
      if (xhr.status === 429) {
        let html = `
          <p style="color:gold;">Google Books is temporarily rate-limiting requests.</p>
          <p>Showing fallback search results for development.</p>
        `;

        fallbackSearchBooks.forEach(function (book) {
          html += `
            <div class="book">
              ${
                book.thumbnail
                  ? `<img src="${book.thumbnail}" alt="Cover for ${book.title}">`
                  : `<div>No image available</div>`
              }
              <h3><a href="book-details.html?id=${book.id}">${book.title}</a></h3>
              <p>${book.authors.join(", ")}</p>
            </div>
          `;
        });

        $("#results").html(html);
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
  }

  function renderSearchResults(data) {
    let html = "";

    if (!data.items || data.items.length === 0) {
      $("#results").html("<p>No books found.</p>");
      return;
    }

    data.items.forEach(function (book) {
      const title = book.volumeInfo.title || "Untitled";
      const id = book.id;
      const authors = Array.isArray(book.volumeInfo.authors)
        ? book.volumeInfo.authors.join(", ")
        : "N/A";

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
          <h3><a href="book-details.html?id=${id}">${title}</a></h3>
          <p>${authors}</p>
        </div>
      `;
    });

    $("#results").html(html);
  }
});