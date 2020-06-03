import React, { Component } from "react";
import "./App.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

const DEFAULT_QUERY = "";
const DEFAULT_HPP = "10";

const PATH_BASE = "https://hn.algolia.com/api/v1";
const PATH_SEARCH = "/search";
const PARAM_SEARCH = "query=";
const PARAM_PAGE = "page=";
const PARAM_HPP = "hitsPerPage=";

const largeColumn = {
  width: "40%",
};

const midColumn = {
  width: "30%",
};

const smallColumn = {
  width: "10%",
};

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      result: null,
      searchTerm: DEFAULT_QUERY,
      error: null,
      isLoading: false,
    };

    this.setSearchTopStories = this.setSearchTopStories.bind(this);
    this.fetchSearchTopStories = this.fetchSearchTopStories.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
  }

  setSearchTopStories(result) {
    const { hits, page } = result;

    const oldHits = page !== 0 ? this.state.result.hits : [];

    const updatedHits = [...oldHits, ...hits];

    this.setState({
      result: { hits: updatedHits, page },
      isLoading: false,
    });
  }

  //fetch function
  fetchSearchTopStories(searchTerm, page = 0) {
    this.setState({ isLoading: true });
    fetch(
      `${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`
    )
      .then((response) => response.json())
      .then((result) => this.setSearchTopStories(result))
      .catch((error) => this.setState({ error }));
  }

  componentDidMount() {
    const { searchTerm } = this.state;
    if (searchTerm !== "") {
      this.fetchSearchTopStories(searchTerm);
    }
  }

  onSearchChange(event) {
    this.setState({ searchTerm: event.target.value });
  }

  onSearchSubmit(event) {
    const { searchTerm } = this.state;

    this.fetchSearchTopStories(searchTerm);

    event.preventDefault();
  }

  onDismiss(id) {
    const isNotId = (item) => item.objectID !== id;
    const updatedHits = this.state.result.hits.filter(isNotId);
    this.setState({
      result: { ...this.state.result, hits: updatedHits },
    });
  }

  render() {
    const { searchTerm, result, error, isLoading } = this.state;

    if (error) {
      return <p>oops! some thing went wrong</p>;
    }

    const page = (result && result.page) || 0;
    return (
      <div className="page">
        <div className="interactions">
          <h1>Welcome to Hacker news</h1>
          <Search
            value={searchTerm}
            onChange={this.onSearchChange}
            onSubmit={this.onSearchSubmit}
          >
            Search
          </Search>
        </div>

        {result && <Table list={result.hits} onDismiss={this.onDismiss} />}

        <div className="interactions">
          {isLoading ? (
            <FontAwesomeIcon icon={faSpinner} size="2x" spin />
          ) : (
            <Button
              onClick={() => this.fetchSearchTopStories(searchTerm, page + 1)}
            >
              More Results
            </Button>
          )}
        </div>
      </div>
    );
  }
}

// const Search = ({ value, onChange, onSubmit, children }) => (
//   <form onSubmit={onSubmit}>
//     <input type="text" value={value} onChange={onChange} />
//     <button type="submit">{children}</button>
//   </form>
// );
class Search extends Component {
  componentDidMount() {
    if (this.input) {
      this.input.focus();
    }
  }
  render() {
    const { value, onChange, onSubmit, children } = this.props;
    return (
      <form onSubmit={onSubmit}>
        <input
          type="text"
          value={value}
          onChange={onChange}
          ref={(el) => (this.input = el)}
        />
        <button type="submit">{children}</button>
      </form>
    );
  }
}

const Table = ({ list, onDismiss }) => (
  <div className="table">
    {list.map((item) => (
      <div key={item.objectID} className="table-row">
        <span style={largeColumn}>
          <a href={item.url}>{item.title}</a>
        </span>
        <span style={midColumn}>Author:{" " + item.author}</span>
        <span style={smallColumn}>Comments:{item.num_comments}</span>
        <span style={smallColumn}>Rating:{item.points}</span>
        <span style={smallColumn}>
          <Button
            onClick={() => onDismiss(item.objectID)}
            className="button-inline"
          >
            Dismiss
          </Button>
        </span>
      </div>
    ))}
  </div>
);

const Button = ({ onClick, className = "", children }) => (
  <button onClick={onClick} className={className} type="button">
    {children}
  </button>
);

const Loading = () => <div>Loading...</div>;

export default App;
