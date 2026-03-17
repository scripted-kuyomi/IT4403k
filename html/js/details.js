$(function () {
  console.log("details.js loaded");

  const params = new URLSearchParams(window.location.search);
  const bookId = params.get("id");

  console.log("Book ID:", bookId);

  if (!bookId) {
    $("#detailsOutput").html("<p>No book ID was provided in the URL.</p>");
    return;
  }

  const url = `https://www.googleapis.com/books/v1/volumes/${bookId}`;

  $.getJSON(url, function (data) {
    const v = data.volumeInfo || {};
    const s = data.saleInfo || {};

    const title = v.title || "Untitled";
    const authors = Array.isArray(v.authors) ? v.authors.join(", ") : "N/A";
    const publisher = v.publisher || "N/A";
    const description = v.description || "No description available.";
    const publishedDate = v.publishedDate || "N/A";

    const thumbnail = v.imageLinks
      ? (v.imageLinks.thumbnail || v.imageLinks.smallThumbnail)
      : "";

    let price = "Not available";
    if (s.listPrice && s.listPrice.amount && s.listPrice.currencyCode) {
      price = `${s.listPrice.amount} ${s.listPrice.currencyCode}`;
    }

    $("#detailsOutput").html(`
      <div class="details-layout">
        <div>
          ${
            thumbnail
              ? `<img src="${thumbnail}" alt="Cover for ${title}" class="book-cover">`
              : `<div class="book-cover" style="height:300px; display:flex; align-items:center; justify-content:center;">No Image</div>`
          }
        </div>

        <div class="details-card">
          <h2>${title}</h2>
          <p class="detail-row"><strong>Authors:</strong> ${authors}</p>
          <p class="detail-row"><strong>Publisher:</strong> ${publisher}</p>
          <p class="detail-row"><strong>Published Date:</strong> ${publishedDate}</p>
          <p class="detail-row"><strong>Price:</strong> ${price}</p>
          <p class="detail-row"><strong>Description:</strong></p>
          <div>${description}</div>
        </div>
      </div>
    `);
  }).fail(function (xhr, status, error) {
    console.log("Details request failed:", status, xhr.status, error);
    $("#detailsOutput").html(`
      <p>Could not load book details.</p>
      <p>HTTP code: ${xhr.status}</p>
      <p>Status: ${status}</p>
      <p>Error: ${error}</p>
    `);
  });
});