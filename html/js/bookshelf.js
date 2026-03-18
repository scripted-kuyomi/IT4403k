$(function () {
  const myBooks = ["8kwoEQAAQBAJ", "b93lDwAAQBAJ", "HOmCDwAAQBAJ"];
  let cards = {};
  $("#bookshelfOutput").html("<p>Loading bookshelf...</p>");

  function renderAll() {
    let html = "";
    myBooks.forEach(function (id) {
      if (!cards[id]) return; // skip books not yet loaded
      const book = cards[id];
      const title   = book.title || "Untitled";
      const authors = Array.isArray(book.authors) ? book.authors.join(", ") : "N/A";

      const thumb = (book.thumbnail || "").replace("http://", "https://");

      html += `
        <div class="book-card">
          ${thumb
            ? `<img src="${thumb}" alt="Cover for ${title}">`
            : `<div style="height:250px; display:flex; align-items:center; justify-content:center; color:#aaa;">No Image</div>`}
          <h3><a href="book-details.html?id=${id}">${title}</a></h3>
          <p class="meta-text">${authors}</p>
        </div>
      `;
    });

    if (html) {
      $("#bookshelfOutput").html(html);
    } else {
      $("#bookshelfOutput").html("<p>No books loaded yet.</p>");
    }
  }

  function loadBook(index) {
    if (index >= myBooks.length) return;

    const id = myBooks[index];
    const cacheKey = `bookshelf_${id}`;
    const cached = sessionStorage.getItem(cacheKey);

    if (cached) {
      cards[id] = JSON.parse(cached);
      renderAll();
      loadBook(index + 1); 
      return;
    }

    $.getJSON(`https://www.googleapis.com/books/v1/volumes/${id}`)
      .done(function (data) {
        const v = data.volumeInfo || {};
        const book = {
          title:     v.title || "Untitled",
          authors:   Array.isArray(v.authors) ? v.authors : ["N/A"],
          thumbnail: v.imageLinks
            ? (v.imageLinks.thumbnail || v.imageLinks.smallThumbnail || "")
            : ""
        };
        sessionStorage.setItem(cacheKey, JSON.stringify(book));

        cards[id] = book;
        renderAll();

        setTimeout(function () { loadBook(index + 1); }, 400);
      })
      .fail(function (xhr) {
        console.error("Failed to load book:", id, xhr.status);
        cards[id] = { title: `Book ${id} (failed to load)`, authors: [], thumbnail: "" };
        renderAll();
        setTimeout(function () { loadBook(index + 1); }, 400);
      });
  }

  loadBook(0);
});