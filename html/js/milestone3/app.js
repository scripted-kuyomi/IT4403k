$(function () {
  let currentSearchTerm = "";
  let currentPage = 1;
  const resultsPerPage = 10;
  const totalPages = 5;
  const apiKey = "AIzaSyCmDf4-O2a9aQMMt4LLaUrROJF_t5rFkiU";

  const bookshelfIds = [
    "8kwoEQAAQBAJ",
    "b93lDwAAQBAJ",
    "HOmCDwAAQBAJ"
  ];

  buildPagination();
  loadBookshelf();

  $("#searchBtn").on("click", function () {
    const searchTerm = $("#searchInput").val().trim();

    if (!searchTerm) {
      $("#searchResults").html(`<p class="placeholder-text">Please enter a search term.</p>`);
      return;
    }

    currentSearchTerm = searchTerm;
    currentPage = 1;
    updatePageButtons();
    searchBooks();
  });

  function buildPagination() {
    let html = "";

    for (let i = 1; i <= totalPages; i++) {
      html += `<button class="page-btn" data-page="${i}">Page ${i}</button>`;
    }

    $("#pagination").html(html);

    $(".page-btn").on("click", function () {
      if (!currentSearchTerm) {
        $("#searchResults").html(`<p class="placeholder-text">Please search for a book first.</p>`);
        return;
      }

      currentPage = parseInt($(this).attr("data-page"), 10);
      updatePageButtons();
      searchBooks();
    });

    updatePageButtons();
  }

  function updatePageButtons() {
    $(".page-btn").removeClass("active-page");
    $(`.page-btn[data-page="${currentPage}"]`).addClass("active-page");

    if (currentSearchTerm) {
      $("#pageStatus").text(`Showing page ${currentPage} of ${totalPages} for "${currentSearchTerm}"`);
    } else {
      $("#pageStatus").text("No search yet.");
    }
  }

  function searchBooks() {
    const startIndex = (currentPage - 1) * resultsPerPage;
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(currentSearchTerm)}&maxResults=${resultsPerPage}&startIndex=${startIndex}&key=${apiKey}`;

    $("#searchResults").html(`<p class="placeholder-text">Loading search results...</p>`);

    $.getJSON(url, function (data) {
      renderSearchResults(data);
    }).fail(function (xhr, status, error) {
      $("#searchResults").html(`
        <p class="placeholder-text">Could not load search results.</p>
        <p class="placeholder-text">HTTP code: ${xhr.status}</p>
        <p class="placeholder-text">Status: ${status}</p>
        <p class="placeholder-text">Error: ${error}</p>
      `);
    });
  }

  function renderSearchResults(data) {
    if (!data.items || data.items.length === 0) {
      $("#searchResults").html(`<p class="placeholder-text">No books found.</p>`);
      return;
    }

    const books = data.items.map(function (item) {
      return normalizeVolume(item);
    });

    $("#searchResults").html(renderBookCards(books));
  }

  function loadBookshelf() {
    $("#bookshelfResults").html(`<p class="placeholder-text">Loading bookshelf books...</p>`);

    let rendered = "";
    let loadedCount = 0;

    bookshelfIds.forEach(function (id) {
      $.getJSON(`https://www.googleapis.com/books/v1/volumes/${id}?key=${apiKey}`, function (data) {
        const book = normalizeVolume(data);
        rendered += renderBookCards([book]);
        loadedCount++;

        $("#bookshelfResults").html(rendered);

        if (loadedCount === bookshelfIds.length && !rendered) {
          $("#bookshelfResults").html(`<p class="placeholder-text">No books available in bookshelf.</p>`);
        }
      }).fail(function (xhr, status, error) {
        loadedCount++;
        rendered += `
          <div class="book-card">
            <p>Could not load book ID: ${id}</p>
            <p>HTTP ${xhr.status}</p>
          </div>
        `;
        $("#bookshelfResults").html(rendered);
      });
    });
  }

  function renderBookCards(books) {
    let html = "";

    books.forEach(function (book) {
      html += `
        <div class="book-card">
          ${
            book.thumbnail
              ? `<img src="${book.thumbnail}" alt="Cover for ${escapeHtml(book.title)}">`
              : `<div class="no-image">No image available</div>`
          }
          <h3>${escapeHtml(book.title)}</h3>
          <p>${escapeHtml(Array.isArray(book.authors) ? book.authors.join(", ") : "N/A")}</p>
          <button class="details-btn" data-id="${book.id}">View Details</button>
        </div>
      `;
    });

    return html;
  }

  $(document).on("click", ".details-btn", function () {
    const id = $(this).attr("data-id");
    loadBookDetails(id);
  });

  function loadBookDetails(bookId) {
    $("#detailsPanel").html(`<p class="placeholder-text">Loading book details...</p>`);

    $.getJSON(`https://www.googleapis.com/books/v1/volumes/${bookId}?key=${apiKey}`, function (data) {
      const book = normalizeVolume(data);
      renderDetails(book);
    }).fail(function (xhr, status, error) {
      $("#detailsPanel").html(`
        <p class="placeholder-text">Could not load details.</p>
        <p class="placeholder-text">HTTP code: ${xhr.status}</p>
        <p class="placeholder-text">Status: ${status}</p>
        <p class="placeholder-text">Error: ${error}</p>
      `);
    });
  }

  function renderDetails(book) {
    $("#detailsPanel").html(renderDetailsHtml(book));
  }

  function renderDetailsHtml(book) {
    const authorsText = Array.isArray(book.authors) ? book.authors.join(", ") : "N/A";

    return `
      <div class="details-layout">
        <div>
          ${
            book.thumbnail
              ? `<img src="${book.thumbnail}" alt="Cover for ${escapeHtml(book.title)}" class="book-cover">`
              : `<div class="no-image">No image available</div>`
          }
        </div>

        <div>
          <h3>${escapeHtml(book.title)}</h3>
          <p class="detail-row"><strong>Authors:</strong> ${escapeHtml(authorsText)}</p>
          <p class="detail-row"><strong>Publisher:</strong> ${escapeHtml(book.publisher || "N/A")}</p>
          <p class="detail-row"><strong>Published:</strong> ${escapeHtml(book.publishedDate || "N/A")}</p>
          <p class="detail-row"><strong>Description:</strong></p>
          <div>${book.description || "No description available."}</div>
        </div>
      </div>
    `;
  }

  function normalizeVolume(data) {
    const v = data.volumeInfo || {};

    return {
      id: data.id || "",
      title: v.title || "Untitled",
      authors: Array.isArray(v.authors) ? v.authors : ["N/A"],
      publisher: v.publisher || "N/A",
      publishedDate: v.publishedDate || "N/A",
      description: v.description || "No description available.",
      thumbnail: v.imageLinks
        ? (v.imageLinks.thumbnail || v.imageLinks.smallThumbnail || "")
        : ""
    };
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
});