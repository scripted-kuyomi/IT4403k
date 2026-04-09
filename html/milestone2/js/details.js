$(function () {

  const params = new URLSearchParams(window.location.search);
  const bookId = params.get("id");

  if (!bookId) {
    $("#detailsOutput").html("<p style='color:red;'>No book ID provided. Please go back and select a book.</p>");
    return;
  }

  const cacheKey = `detail_${bookId}`;
  const cached = sessionStorage.getItem(cacheKey);

  if (cached) {
    renderDetails(JSON.parse(cached));
    return;
  }

  const url = `https://www.googleapis.com/books/v1/volumes/${bookId}?key=AIzaSyBQaGkyDUoiGeEwQPEt05I29Wl4K-jt03M`;

  $.getJSON(url, function (data) {
    sessionStorage.setItem(cacheKey, JSON.stringify(data));
    renderDetails(data);
  }).fail(function (xhr, status, error) {
    $("#detailsOutput").html(`
      <p style="color:red;">Failed to load book details. (HTTP ${xhr.status})</p>
      <p>${error}</p>
    `);
  });

  function renderDetails(data) {
    const info = data.volumeInfo || {};
    const sale = data.saleInfo || {};

    const title       = info.title || "Untitled";
    const authors     = Array.isArray(info.authors) ? info.authors.join(", ") : "N/A";
    const publisher   = info.publisher || "N/A";
    const published   = info.publishedDate || "N/A";
    const description = info.description || "No description available.";
    const pageCount   = info.pageCount ? `${info.pageCount} pages` : "N/A";
    const categories  = Array.isArray(info.categories) ? info.categories.join(", ") : "N/A";
    const language    = info.language ? info.language.toUpperCase() : "N/A";
    const rating      = info.averageRating
      ? `${info.averageRating} / 5 (${info.ratingsCount || 0} ratings)`
      : "N/A";
    const previewLink = info.previewLink || "#";

    let coverSrc = "";
    if (info.imageLinks) {
      coverSrc = (
        info.imageLinks.large ||
        info.imageLinks.medium ||
        info.imageLinks.thumbnail ||
        info.imageLinks.smallThumbnail ||
        ""
      ).replace("http://", "https://");
    }

    let priceHTML = "Not available for sale";
    if (sale.saleability === "FOR_SALE" && sale.listPrice) {
      priceHTML = `${sale.listPrice.amount} ${sale.listPrice.currencyCode}`;
    } else if (sale.saleability === "FREE") {
      priceHTML = "Free";
    }

    const html = `
      <div class="details-layout">
        <div>
          ${coverSrc
            ? `<img class="book-cover" src="${coverSrc}" alt="Cover for ${title}">`
            : `<div class="book-cover" style="height:300px; display:flex; align-items:center; justify-content:center; color:#aaa;">No Image</div>`}
        </div>
        <div class="details-card">
          <h2>${title}</h2>
          <div class="detail-row"><strong>Author(s):</strong> ${authors}</div>
          <div class="detail-row"><strong>Publisher:</strong> ${publisher}</div>
          <div class="detail-row"><strong>Published:</strong> ${published}</div>
          <div class="detail-row"><strong>Pages:</strong> ${pageCount}</div>
          <div class="detail-row"><strong>Categories:</strong> ${categories}</div>
          <div class="detail-row"><strong>Language:</strong> ${language}</div>
          <div class="detail-row"><strong>Rating:</strong> ${rating}</div>
          <div class="detail-row"><strong>Price:</strong> ${priceHTML}</div>
          <div class="detail-row" style="margin-top:16px;">
            <a href="${previewLink}" target="_blank" rel="noopener" style="color:#d4af37;">
              Preview on Google Books ↗
            </a>
          </div>
          <hr style="border-color:#2a2a2a; margin:16px 0;">
          <h3>Description</h3>
          <p style="line-height:1.7; color:#cfcfcf;">${description}</p>
        </div>
      </div>
    `;

    $("#detailsOutput").html(html);

    document.title = `${title} | Book Details`;
  }
});
