$(function () {
  let currentSearchTerm = "";
  let currentPage = 1;
  const resultsPerPage = 10;
  const maxPages = 6;

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

  $("#searchInput").on("keypress", function (e) {
    if (e.which === 13) $("#searchBtn").trigger("click");
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

    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(currentSearchTerm)}&maxResults=${resultsPerPage}&startIndex=${startIndex}&key=AIzaSyCmDf4-O2a9aQMMt4LLaUrROJF_t5rFkiU`;

    $.getJSON(url, function (data) {
      sessionStorage.setItem(cacheKey, JSON.stringify(data));
      renderSearchResults(data);
    }).fail(function (xhr, status, error) {

      $("#results").html(`
        <p style="color:red;">Could not load results. (HTTP ${xhr.status})</p>
        <p>${error}</p>
      `);

    }).always(function () {
      $btn.prop("disabled", false).text("Search");
    });
  }

  function renderSearchResults(data) {
    if (!data.items || data.items.length === 0) {
      $("#results").html("<p>No books found. Try a different search term.</p>");
      return;
    }

    let html = "";
    data.items.forEach(function (book) {
      const info = book.volumeInfo || {};
      const title = info.title || "Untitled";
      const id = book.id;
      const authors = Array.isArray(info.authors) ? info.authors.join(", ") : "N/A";

      let thumbnail = "";
      if (info.imageLinks) {
        thumbnail = (info.imageLinks.thumbnail || info.imageLinks.smallThumbnail || "")
          .replace("http://", "https://");
      }

      html += `
        <div class="book-card">
          ${thumbnail
            ? `<img src="${thumbnail}" alt="Cover for ${title}">`
            : `<div class="no-image">No Image</div>`}
          <h3><a href="book-details.html?id=${id}">${title}</a></h3>
          <p class="meta-text">${authors}</p>
        </div>
      `;
    });

    $("#results").html(`<div class="books-grid">${html}</div>`);
  }
});
