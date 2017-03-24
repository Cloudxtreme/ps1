import React from 'react';
import { render } from 'react-dom';
import { Router, Route, browserHistory } from 'react-router';
import BuilderPage from './components/BuilderPage';
import CreditsPage from './components/CreditsPage';
import LessonPage from './components/LessonPage';
import MainPage from './components/MainPage';
import PopularPage from './components/PopularPage';
import NotFoundPage from './components/NotFoundPage';

render((
  <Router history={browserHistory}>
    <Route path="/" component={MainPage}>
      <Route path="/build" component={BuilderPage}>
        <Route path="/build/:id" component={BuilderPage} />
      </Route>
      <Route path="/credits" component={CreditsPage} />
      <Route path="/lesson" component={LessonPage} />
      <Route path="/popular" component={PopularPage} />
      <Route path="*" component={NotFoundPage} />
    </Route>
  </Router>
), document.getElementById('app'));
