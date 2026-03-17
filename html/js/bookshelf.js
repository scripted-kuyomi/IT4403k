$(function () {
  const myBooks = ["8kwoEQAAQBAJ", "b93lDwAAQBAJ", "HOmCDwAAQBAJ"];
  $("#bookshelfOutput").empty();

  myBooks.forEach(function (id) {
    $.getJSON(`https://www.googleapis.com/books/v1/volumes/${id}`)
      .done(function (data) {
        const v = data.volumeInfo || {};
        const title = v.title || "Untitled";
        const authors = Array.isArray(v.authors) ? v.authors.join(", ") : "N/A";
        const thumb = v.imageLinks ? (v.imageLinks.thumbnail || v.imageLinks.smallThumbnail) : "";

        const card = `
          <div class="book-card">
            ${thumb ? `<img src="${thumb}" alt="Cover for ${title}">` : `<div style="height:250px; display:flex; align-items:center; justify-content:center;">No Image</div>`}
            <h3><a href="book-details.html?id=${id}">${title}</a></h3>
            <p>${authors}</p>
          </div>`;
        $("#bookshelfOutput").append(card);
      })
      .fail(function (xhr, status, err) {
        console.error("Book load failed:", id, xhr.status, status, err);
        $("#bookshelfOutput").append(`<div class="book-card">Failed to load book ${id} (HTTP ${xhr.status})</div>`);
      });
  });

  $(".nav-btn").click(function () {
    $(".nav-btn").removeClass("active");
    $(this).addClass("active");
  });
});