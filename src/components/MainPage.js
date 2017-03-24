import React from 'react';
import { Link } from 'react-router';

export default class MainPage extends React.Component {
  render() {
    return (
      <div className="page-main">
        <h2>Main Page</h2>
        <ul>
          <li><Link to="/build">Builder Page</Link></li>
          <li><Link to="/lesson">Lessons Page</Link></li>
          <li><Link to="/credits">Credits Page</Link></li>
          <li><Link to="/popular">Popular Page</Link></li>
          <li><Link to="/index.html">Index.html</Link></li>
          <li><Link to="/sdr234">URL not found</Link></li>
          <li><Link to="/NotFound">Not Found Page</Link></li>
        </ul>
        {this.props.children}
      </div>);
  }
}
