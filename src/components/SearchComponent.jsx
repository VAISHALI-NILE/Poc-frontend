import React, { useState } from "react";
import axios from "axios";
import {
  FaEye,
  FaThumbsUp,
  FaSearch,
  FaVideo,
  FaNewspaper,
  FaBook,
  FaBlog,
  FaGlobe,
  FaTimes,
} from "react-icons/fa";

import "./SearchComponent.css";

const SearchComponent = () => {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [results, setResults] = useState({
    videos: [],
    articles: [],
    papers: [],
    blogs: [],
  });
  const [error, setError] = useState("");
  const [pageInfo, setPageInfo] = useState({
    videoPageToken: "",
    articleStartIndex: 1,
    paperPage: 1,
    blogStartIndex: 1,
  });
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const requests = [
        axios
          .get(
            `https://poc-backend-waps.onrender.com/search?q=${query}&pageToken=${pageInfo.videoPageToken}`
          )
          .then((response) => ({
            key: "videos",
            data: response.data.youtube || [],
            error: null,
          }))
          .catch((err) => ({
            key: "videos",
            data: [],
            error: err.message,
          })),

        axios
          .get(
            `https://poc-backend-waps.onrender.com/articles?q=${query}&start=${pageInfo.articleStartIndex}`
          )
          .then((response) => ({
            key: "articles",
            data: response.data.articles || [],
            error: null,
          }))
          .catch((err) => ({
            key: "articles",
            data: [],
            error: err.message,
          })),

        axios
          .get(
            `https://poc-backend-waps.onrender.com/papers?q=${query}&page=${pageInfo.paperPage}`
          )
          .then((response) => ({
            key: "papers",
            data: response.data.papers || [],
            error: null,
          }))
          .catch((err) => ({
            key: "papers",
            data: [],
            error: err.message,
          })),

        axios
          .get(
            `https://poc-backend-waps.onrender.com/blogs?q=${query}&start=${pageInfo.blogStartIndex}`
          )
          .then((response) => ({
            key: "blogs",
            data: response.data.blogs || [],
            error: null,
          }))
          .catch((err) => ({
            key: "blogs",
            data: [],
            error: err.message,
          })),
      ];

      // Wait for all promises to settle (either resolved or rejected)
      const resultsArray = await Promise.allSettled(requests);

      const updatedResults = {
        videos: [],
        articles: [],
        papers: [],
        blogs: [],
      };

      resultsArray.forEach((result) => {
        if (result.status === "fulfilled") {
          updatedResults[result.value.key] = result.value.data;
        } else {
          console.error(`Error fetching ${result.value.key}:`, result.reason);
          setError(`Error fetching ${result.value.key}: ${result.reason}`);
        }
      });

      // Update the results with successful responses
      setResults(updatedResults);

      // Update pagination info based on successful responses
      setPageInfo((prev) => ({
        videoPageToken: updatedResults.videos.length
          ? pageInfo.videoPageToken
          : "",
        articleStartIndex: updatedResults.articles.length
          ? updatedResults.articles.length + prev.articleStartIndex
          : prev.articleStartIndex,
        paperPage: prev.paperPage + (updatedResults.papers.length > 0 ? 1 : 0),
        blogStartIndex: updatedResults.blogs.length
          ? updatedResults.blogs.length + prev.blogStartIndex
          : prev.blogStartIndex,
      }));

      // If all results are empty, show a general error message
      if (
        updatedResults.videos.length === 0 &&
        updatedResults.articles.length === 0 &&
        updatedResults.papers.length === 0 &&
        updatedResults.blogs.length === 0
      ) {
        setError("No results found. Please try a different query.");
      }
    } catch (error) {
      console.error("Error fetching data", error);
      setError("There was an error fetching data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadMoreResults = async () => {
    setLoading(true);

    try {
      if (filter === "all" || filter === "videos") {
        const videoResponse = await axios.get(
          `http://localhost:3000/search?q=${query}&pageToken=${pageInfo.videoPageToken}`
        );
        setResults((prevResults) => ({
          ...prevResults,
          videos: [
            ...prevResults.videos,
            ...(videoResponse.data.youtube || []),
          ],
        }));
        setPageInfo((prevPageInfo) => ({
          ...prevPageInfo,
          videoPageToken: videoResponse.data.nextPageToken || "",
        }));
      }

      if (filter === "all" || filter === "articles") {
        const articleResponse = await axios.get(
          `http://localhost:3000/articles?q=${query}&start=${pageInfo.articleStartIndex}`
        );
        setResults((prevResults) => ({
          ...prevResults,
          articles: [
            ...prevResults.articles,
            ...(articleResponse.data.articles || []),
          ],
        }));
        setPageInfo((prevPageInfo) => ({
          ...prevPageInfo,
          articleStartIndex:
            prevPageInfo.articleStartIndex +
            articleResponse.data.articles.length,
        }));
      }

      if (filter === "all" || filter === "papers") {
        const paperResponse = await axios.get(
          `http://localhost:3000/papers?q=${query}&page=${pageInfo.paperPage}`
        );
        setResults((prevResults) => ({
          ...prevResults,
          papers: [...prevResults.papers, ...(paperResponse.data.papers || [])],
        }));
        setPageInfo((prevPageInfo) => ({
          ...prevPageInfo,
          paperPage: prevPageInfo.paperPage + 1,
        }));
      }

      if (filter === "all" || filter === "blogs") {
        const blogResponse = await axios.get(
          `http://localhost:3000/blogs?q=${query}&start=${pageInfo.blogStartIndex}`
        );
        setResults((prevResults) => ({
          ...prevResults,
          blogs: [...prevResults.blogs, ...(blogResponse.data.blogs || [])],
        }));
        setPageInfo((prevPageInfo) => ({
          ...prevPageInfo,
          blogStartIndex:
            prevPageInfo.blogStartIndex + blogResponse.data.blogs.length,
        }));
      }
    } catch (error) {
      console.error("Error fetching more data", error);
      setError("There was an error fetching more data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setQuery("");
    setResults({
      videos: [],
      articles: [],
      papers: [],
      blogs: [],
    });
    setError("");
    setPageInfo({
      videoPageToken: "",
      articleStartIndex: 1,
      paperPage: 1,
      blogStartIndex: 1,
    });
  };

  return (
    <div className="search-container">
      <h1 className="title">Search for Resources</h1>
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter search term"
          className="search-input"
        />
        <button type="submit" className="search-button">
          <FaSearch />
        </button>

        <button type="button" onClick={clearSearch} className="clear-button">
          <FaTimes />
        </button>
      </form>
      <div className="filter-container">
        <label>
          <FaGlobe />
          <input
            type="radio"
            value="all"
            checked={filter === "all"}
            onChange={() => setFilter("all")}
          />
          All
        </label>
        <label>
          <FaVideo />
          <input
            type="radio"
            value="videos"
            checked={filter === "videos"}
            onChange={() => setFilter("videos")}
          />
          Videos
        </label>
        <label>
          <FaNewspaper />
          <input
            type="radio"
            value="articles"
            checked={filter === "articles"}
            onChange={() => setFilter("articles")}
          />
          Articles
        </label>
        <label>
          <FaBook />
          <input
            type="radio"
            value="papers"
            checked={filter === "papers"}
            onChange={() => setFilter("papers")}
          />
          Academic Papers
        </label>
        <label>
          <FaBlog />
          <input
            type="radio"
            value="blogs"
            checked={filter === "blogs"}
            onChange={() => setFilter("blogs")}
          />
          Blogs
        </label>
      </div>
      {error && <p className="error-message">{error}</p>}
      <div className="results-container">
        {loading && <div className="loading-spinner"></div>}
        {filter === "all" || filter === "videos" ? (
          <>
            <h2 className="results-title">Videos</h2>
            <div className="results-grid">
              {results.videos.map((video, index) => (
                <div key={index} className="result-card">
                  <a
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="anker-tag"
                  >
                    <img
                      src={
                        video.thumbnail
                          ? video.thumbnail
                          : "https://via.placeholder.com/150"
                      }
                      alt={video.title}
                      className="result-image"
                    />
                    <h3 className="result-title">{video.title}</h3>
                    {video.views !== 0 && (
                      <p className="result-info">
                        <FaThumbsUp /> {video.likes} | <FaEye /> {video.views}
                      </p>
                    )}
                  </a>
                </div>
              ))}
              {results.videos.length === 0 && !loading && (
                <p>No videos found.</p>
              )}
            </div>
          </>
        ) : null}
        {filter === "all" || filter === "articles" ? (
          <>
            <h2 className="results-title">Articles</h2>
            <div className="results-grid">
              {results.articles.map((article, index) => (
                <div key={index} className="result-card">
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="anker-tag"
                  >
                    <h3 className="result-title">{article.title}</h3>
                    {article.snippet && (
                      <p className="result-info">{article.snippet}</p>
                    )}
                    <p style={{ color: "blueviolet" }}>{article.source}</p>
                  </a>
                </div>
              ))}
              {results.articles.length === 0 && !loading && (
                <p>No articles found.</p>
              )}
            </div>
          </>
        ) : null}
        {filter === "all" || filter === "papers" ? (
          <>
            <h2 className="results-title">Academic Papers</h2>
            <div className="results-grid">
              {results.papers.map((paper, index) => (
                <div key={index} className="result-card">
                  <a
                    href={paper.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="anker-tag"
                  >
                    <h3 className="result-title">{paper.title}</h3>
                    {paper.summary && (
                      <p className="result-info">{paper.summary}</p>
                    )}
                  </a>
                </div>
              ))}
              {results.papers.length === 0 && !loading && (
                <p>No academic papers found.</p>
              )}
            </div>
          </>
        ) : null}
        {filter === "all" || filter === "blogs" ? (
          <>
            <h2 className="results-title">Blogs</h2>
            <div className="results-grid">
              {results.blogs.map((blog, index) => (
                <div key={index} className="result-card">
                  <a
                    href={blog.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="anker-tag"
                  >
                    <img
                      src={
                        blog.imageUrl
                          ? blog.imageUrl
                          : "https://via.placeholder.com/150"
                      }
                      alt={blog.title || "Blog post image"}
                      className="result-image"
                    />
                    <h3 className="result-title">{blog.title}</h3>
                    {blog.snippet && (
                      <p className="result-info">{blog.snippet}</p>
                    )}
                  </a>
                </div>
              ))}
              {results.blogs.length === 0 && !loading && <p>No blogs found.</p>}
            </div>
          </>
        ) : null}
      </div>
      <button
        onClick={loadMoreResults}
        className="load-more-button"
        disabled={loading}
      >
        {loading ? "Loading..." : "Load More"}
      </button>
    </div>
  );
};

export default SearchComponent;
