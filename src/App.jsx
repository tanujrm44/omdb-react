import React from "react"
import Header from "./components/Header"
import {
  InputGroup,
  Form,
  Container,
  Card,
  Button,
  Spinner,
  Row,
  Col,
  Pagination,
} from "react-bootstrap"
import { useDebounce } from "use-debounce"

export default function App() {
  const [movies, setMovies] = React.useState([])
  const [search, setSearch] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [totalResults, setTotalResults] = React.useState(0)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState(null)
  const [debouncedSearch] = useDebounce(search, 500)

  const moviesPerPage = import.meta.env.VITE_APP_MOVIES_PER_PAGE

  React.useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(
          `https://www.omdbapi.com/?s=${debouncedSearch}&page=${page}&apikey=${
            import.meta.env.VITE_APP_OMDB_API_KEY
          }`
        )
        const data = await response.json()
        if (data.Response === "True") {
          setMovies(data.Search)
          setTotalResults(parseInt(data.totalResults, 10))
        } else {
          setMovies([])
          setError(data.Error || "No movies found.")
        }
      } catch (error) {
        setError("Failed to fetch movies. Please try again later.")
      } finally {
        setLoading(false)
      }
    }
    if (debouncedSearch.length > 2) {
      fetchMovies()
    }
  }, [debouncedSearch, page])

  const handleSearchInput = (event) => {
    setSearch(event.target.value)
    setPage(1)
  }

  const handlePageChange = (newPage) => {
    setPage(newPage)
  }

  const totalPages = Math.ceil(totalResults / moviesPerPage)

  return (
    <>
      <Header />
      <Container>
        <InputGroup className="my-3 w-100 w-md-75 w-lg-50 mx-auto">
          <Form.Control
            placeholder="Search for a movie (min 3 characters)"
            value={search}
            onChange={handleSearchInput}
          />
          <Button
            variant="primary"
            onClick={() => setSearch(search.trim())}
            disabled={loading}
          >
            {loading ? <Spinner animation="border" size="sm" /> : "Search"}
          </Button>
          {search && (
            <Button
              variant="secondary"
              onClick={() => {
                setSearch("")
                setMovies([])
                setPage(1)
              }}
              disabled={loading}
            >
              Clear
            </Button>
          )}
        </InputGroup>

        {loading ? (
          <Spinner animation="border" className="d-block mx-auto" />
        ) : error ? (
          <p className="text-danger text-center">{error}</p>
        ) : (
          <Row>
            {movies.map((movie) => (
              <Col
                key={movie.imdbID}
                xs={12}
                sm={6}
                md={4}
                lg={3}
                xl={3}
                className="mb-4"
              >
                <Card>
                  <Card.Img
                    variant="top"
                    src={
                      movie.Poster !== "N/A" ? movie.Poster : "/placeholder.png"
                    }
                    alt={movie.Title}
                  />
                  <Card.Body>
                    <Card.Title>{movie.Title}</Card.Title>
                    <Card.Text>Year: {movie.Year}</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {!loading && search.length > 2 && !error && movies.length === 0 && (
          <p className="text-center">No movies found.</p>
        )}

        {!loading && totalPages > 1 && movies.length > 0 && (
          <Pagination className="justify-content-center mt-4">
            <Pagination.First
              onClick={() => handlePageChange(1)}
              disabled={page === 1}
            />
            <Pagination.Prev
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
            />
            {[...Array(totalPages).keys()].slice(0, 5).map((p) => (
              <Pagination.Item
                key={p + 1}
                active={p + 1 === page}
                onClick={() => handlePageChange(p + 1)}
              >
                {p + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
            />
            <Pagination.Last
              onClick={() => handlePageChange(totalPages)}
              disabled={page === totalPages}
            />
          </Pagination>
        )}
      </Container>
    </>
  )
}
