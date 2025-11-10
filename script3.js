const traktKey =
  "ab8e2cb74c1b2fc8e9122105110ac79c2ae9b189e716182faf408a96d237e212";
const tmdbKey = "179619db3dbf92b34d794c3093a89eb0";
const resultsDiv = document.getElementById("results");
const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");

searchBtn.addEventListener("click", searchMovies);

async function searchMovies() {
  const query = searchInput.value.trim();
  if (!query) return alert("Type a movie name fam!");

  resultsDiv.innerHTML = "<p>Loading...</p>";

  try {
    // Fetch from Trakt
    const response = await fetch(
      `https://api.trakt.tv/search/movie?query=${encodeURIComponent(query)}`,
      {
        headers: {
          "Content-Type": "application/json",
          "trakt-api-version": "2",
          "trakt-api-key": traktKey,
        },
      }
    );

    const data = await response.json();
    resultsDiv.innerHTML = "";

    if (!data.length) {
      resultsDiv.innerHTML = "<p>No results found 😕</p>";
      return;
    }

    // Fetch TMDB posters for each movie
    data.forEach(async (item) => {
      const movie = item.movie;
      const card = document.createElement("div");
      card.classList.add("card");

      let posterUrl = "placeholder.jpg"; // default

      if (movie.ids.tmdb) {
        try {
          // Use a CORS-safe proxy for frontend-only calls
          const tmdbRes = await fetch(
            `https://corsproxy.io/?https://api.themoviedb.org/3/movie/${movie.ids.tmdb}?api_key=${tmdbKey}`
          );
          const tmdbData = await tmdbRes.json();

          if (tmdbData.poster_path) {
            posterUrl = `https://image.tmdb.org/t/p/w500${tmdbData.poster_path}`;
          }
        } catch (e) {
          console.warn("TMDB fetch failed:", e);
        }
      }

      card.innerHTML = `
        <img src="${posterUrl}" alt="${movie.title}">
        <div class="card-title">${movie.title} (${movie.year || "N/A"})</div>
      `;

      card.addEventListener("click", () => {
        localStorage.setItem("selectedMovie", JSON.stringify(movie));
        window.location.href = "movie.html";
      });

      resultsDiv.appendChild(card);
    });
  } catch (err) {
    console.error("Error fetching from Trakt:", err);
    resultsDiv.innerHTML = "<p>Something went wrong ⚡</p>";
  }
}
