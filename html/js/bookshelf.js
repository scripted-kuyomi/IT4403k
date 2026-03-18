$(function () {
  const myBooks = ["8kwoEQAAQBAJ", "b93lDwAAQBAJ", "HOmCDwAAQBAJ"];

  const fallbackBooks = {
    "8kwoEQAAQBAJ": {
      title: "Jujutsu Kaisen",
      authors: ["Gege Akutami"],
      thumbnail: ""
    },
    "b93lDwAAQBAJ": {
      title: "Kagurabachi, Vol. 1",
      authors: ["Takeru Hokazono"],
      thumbnail: ""
    },
    "HOmCDwAAQBAJ": {
      title: "Invincible Compendium, Vol. 2",
      authors: ["Robert Kirkman"],
      thumbnail: ""
    }
  };

  let html = "";
  $("#bookshelfOutput").empty();

  function renderBook(id, book) {
    const title = book.title || "Untitled";
    const authors = Array.isArray(book.authors) ? book.authors.join(", ") : "N/A";
    const thumb = book.thumbnail || "";

    html += `
      <div class="book-card">
        ${
          thumb
            ? `<img src="${thumb}" alt="Cover for ${title}">`
            : `<div style="height:250px; display:flex; align-items:center; justify-content:center;">No Image</div>`
        }
        <h3><a href="book-details.html?id=${id}">${title}</a></h3>
        <p>${authors}</p>
      </div>
    `;

    $("#bookshelfOutput").html(html);
  }

  function loadBook(index) {
    if (index >= myBooks.length) return;

    const id = myBooks[index];
    const cacheKey = `bookshelf_${id}`;
    const cached = sessionStorage.getItem(cacheKey);

    if (cached) {
      renderBook(id, JSON.parse(cached));
      setTimeout(function () {
        loadBook(index + 1);
      }, 500);
      return;
    }

    $.getJSON(`https://www.googleapis.com/books/v1/volumes/${id}`)
      .done(function (data) {
        const v = data.volumeInfo || {};
        const book = {
          title: v.title || "Untitled",
          authors: Array.isArray(v.authors) ? v.authors : ["N/A"],
          thumbnail: v.imageLinks ? (v.imageLinks.thumbnail || v.imageLinks.smallThumbnail) : ""
        };

        sessionStorage.setItem(cacheKey, JSON.stringify(book));
        renderBook(id, book);

        setTimeout(function () {
          loadBook(index + 1);
        }, 800);
      })
      .fail(function (xhr, status, err) {
        if (xhr.status === 429 && fallbackBooks[id]) {
          $("#bookshelfOutput").prepend(`
            <p style="color:gold;">Google Books is temporarily rate-limiting requests. Showing fallback data.</p>
          `);
          renderBook(id, fallbackBooks[id]);

          setTimeout(function () {
            loadBook(index + 1);
          }, 500);
        } else {
          $("#bookshelfOutput").append(`
            <div class="book-card">Failed to load book ${id} (HTTP ${xhr.status})</div>
          `);
        }

        console.error("Book load failed:", id, xhr.status, status, err);
      });
  }

  loadBook(0);

  $(".nav-btn").click(function () {
    $(".nav-btn").removeClass("active");
    $(this).addClass("active");
  });
});