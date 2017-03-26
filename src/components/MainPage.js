import React from 'react';
import { Navbar, Nav, NavItem, Jumbotron } from 'react-bootstrap';

export default class MainPage extends React.Component {
  render() {
    return (
      <div className="page-main">
        <div className="container-fluid">
          <Jumbotron bsClass="bg-primary bg-center">
            <h1>PS1 - The Bash Prompt</h1>
            <h3>Create a beautiful prompt for your Bash terminal shell.</h3>
          </Jumbotron>

          <Navbar inverse>
            <Nav>
              <NavItem eventKey={1} href="/build" />
              <NavItem eventKey={1} href="/lesson">Lessons Page</NavItem>
              <NavItem eventKey={2} href="/credits">Credits Page</NavItem>
              <NavItem eventKey={3} href="/popular">Popular Page</NavItem>
              <NavItem eventKey={4} href="/index.html">Index.html</NavItem>
              <NavItem eventKey={5} href="/sdr234">URL not found</NavItem>
            </Nav>
          </Navbar>
          {this.props.children}
        </div>
      </div>);
  }
}
