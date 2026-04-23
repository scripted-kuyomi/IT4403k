$(function () {
  const TMDB_API_KEY = "b08d5f863f9d3348fddb6e18df49fdbe";
  const TMDB_BASE_URL = "https://api.themoviedb.org/3";
  const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

  const state = {
    searchTerm: "",
    currentPage: 1,
    totalPages: 1,
    activeTab: "search",
    activeView: "grid",
    activeCollection: "popular"
  };

  const templates = {
    card: $("#movie-card-template").html(),
    details: $("#details-template").html(),
    empty: $("#empty-template").html()
  };

  const collectionEndpoints = {
    popular: {
      label: "Popular",
      endpoint: "/movie/popular"
    },
    topRated: {
      label: "Top Rated",
      endpoint: "/movie/top_rated"
    }
  };

  init();

  function init() {
    state.searchTerm = $("#searchInput").val().trim() || state.searchTerm;
    bindEvents();
    applyViewClass();
    searchMovies();
    loadCollection();
  }

  function bindEvents() {
    $("#searchForm").on("submit", function (event) {
      event.preventDefault();
      const term = $("#searchInput").val().trim();

      if (!term) {
        renderEmpty("#searchResults", "Search term needed", "Enter a movie title, genre, actor, or keyword to search TMDB.");
        return;
      }

      state.searchTerm = term;
      state.currentPage = 1;
      switchTab("search");
      searchMovies();
    });

    $("#prevPage").on("click", function () {
      if (state.currentPage > 1) {
        state.currentPage--;
        searchMovies();
      }
    });

    $("#nextPage").on("click", function () {
      if (state.currentPage < state.totalPages) {
        state.currentPage++;
        searchMovies();
      }
    });

    $(".tab-btn").on("click", function () {
      switchTab($(this).data("tab"));
    });

    $(".view-btn").on("click", function () {
      state.activeView = $(this).data("view");
      $(".view-btn").removeClass("active");
      $(this).addClass("active");
      applyViewClass();
    });

    $(".collection-btn").on("click", function () {
      state.activeCollection = $(this).data("collection");
      $(".collection-btn").removeClass("active");
      $(this).addClass("active");
      loadCollection();
    });

    $(document).on("click", ".book-card", function () {
      const id = $(this).data("id");

      if (id) {
        loadMovieDetails(id);
      }
    });
  }

  function switchTab(tabName) {
    state.activeTab = tabName;

    $(".tab-btn").removeClass("active").attr("aria-selected", "false");
    $(`.tab-btn[data-tab="${tabName}"]`).addClass("active").attr("aria-selected", "true");

    $(".content-section").removeClass("active");
    $(`#${tabName}Section`).addClass("active");
  }

  function applyViewClass() {
    $(".items-grid")
      .removeClass("grid-view list-view")
      .addClass(`${state.activeView}-view`);
  }

  function searchMovies() {
    $("#searchResults").html(getLoadingHtml("Loading search results..."));
    $("#searchSummary").text(`Searching for "${state.searchTerm}" with AJAX.`);

    tmdbRequest("/search/movie", {
      query: state.searchTerm,
      page: state.currentPage,
      include_adult: false
    })
      .done(function (data) {
        state.totalPages = Math.min(data.total_pages || 1, 500);
        renderMovies("#searchResults", data.results || [], "Search Result");
        updatePagination();
      })
      .fail(function (xhr, status) {
        state.totalPages = 1;
        renderEmpty("#searchResults", "Search unavailable", getApiErrorMessage(status, xhr));
        updatePagination();
      });
  }

  function loadCollection() {
    const collection = collectionEndpoints[state.activeCollection];

    $("#collectionResults").html(getLoadingHtml(`Loading ${collection.label.toLowerCase()} movies...`));
    $("#collectionSummary").text(`${collection.label} collection loaded independently from current search results.`);

    tmdbRequest(collection.endpoint, {
      page: 1
    })
      .done(function (data) {
        renderMovies("#collectionResults", (data.results || []).slice(0, 10), collection.label);
      })
      .fail(function (xhr, status) {
        renderEmpty("#collectionResults", "Collection unavailable", getApiErrorMessage(status, xhr));
      });
  }

  function loadMovieDetails(movieId) {
    $("#detailsPanel").html(getLoadingHtml("Loading movie details..."));

    tmdbRequest(`/movie/${encodeURIComponent(movieId)}`)
      .done(function (data) {
        const movie = normalizeMovie(data, "Selected Movie");
        $("#detailsPanel").html(Mustache.render(templates.details, movie));
      })
      .fail(function (xhr, status) {
        renderEmpty("#detailsPanel", "Details unavailable", getApiErrorMessage(status, xhr));
      });
  }

  function tmdbRequest(endpoint, params) {
    const data = $.extend({
      api_key: TMDB_API_KEY,
      language: "en-US"
    }, params || {});

    return $.ajax({
      url: `${TMDB_BASE_URL}${endpoint}`,
      method: "GET",
      dataType: "json",
      data: data,
      timeout: 12000
    });
  }

  function getApiErrorMessage(status, xhr) {
    if (!TMDB_API_KEY) {
      return "Could not load movies. Add your TMDB API key at the top of app.js.";
    }

    if (status === "timeout") {
      return "Could not load movies. Please refresh the page or try again.";
    }

    if (xhr && xhr.status === 401) {
      return "Could not load movies. Check that your TMDB API key is valid.";
    }

    if (xhr && xhr.status === 429) {
      return "Could not load movies. Please wait a moment and try again.";
    }

    return "Could not load movies. Please refresh the page or try again.";
  }

  function renderMovies(target, items, category) {
    if (!items.length) {
      renderEmpty(target, "No movies found", "Try a different search term or collection.");
      return;
    }

    const movies = items.map(function (item) {
      return normalizeMovie(item, category);
    });

    $(target).html(Mustache.render(templates.card, { movies: movies }));
  }

  function renderEmpty(target, title, message) {
    $(target).html(Mustache.render(templates.empty, {
      title: title,
      message: message
    }));
  }

  function updatePagination() {
    $("#pageStatus").text(`Page ${state.currentPage} of ${state.totalPages}`);
    $("#prevPage").prop("disabled", state.currentPage <= 1);
    $("#nextPage").prop("disabled", state.currentPage >= state.totalPages);
  }

  function normalizeMovie(data, category) {
    const description = data.overview || "No description is available for this movie.";
    const releaseDate = data.release_date || "Not listed";
    const genres = Array.isArray(data.genres) && data.genres.length
      ? data.genres.map(function (genre) {
        return genre.name;
      }).join(", ")
      : "Not listed";

    return {
      id: data.id || "",
      category: category,
      title: data.title || data.original_title || "Untitled",
      releaseDate: releaseDate,
      language: (data.original_language || "N/A").toUpperCase(),
      ratingText: data.vote_average ? `${data.vote_average.toFixed(1)} / 10` : "No rating",
      voteCount: data.vote_count || 0,
      status: data.status || "Not listed",
      runtime: data.runtime ? `${data.runtime} minutes` : "Not listed",
      genresText: genres,
      description: description,
      shortDescription: truncate(description, 130),
      poster: data.poster_path ? `${TMDB_IMAGE_BASE_URL}${data.poster_path}` : "",
      tmdbLink: data.id ? `https://www.themoviedb.org/movie/${data.id}` : ""
    };
  }

  function truncate(value, maxLength) {
    if (value.length <= maxLength) {
      return value;
    }

    return `${value.slice(0, maxLength).trim()}...`;
  }

  function getLoadingHtml(message) {
    return `<div class="empty-state"><h3>${message}</h3><p>Data is being loaded with AJAX.</p></div>`;
  }
});
