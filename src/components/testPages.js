import React from 'react';
import 'should';
import { renderToString } from 'react-dom/server';
import BuilderPage from './BuilderPage';
import CreditsPage from './CreditsPage';
import LessonPage from './LessonPage';
import MainPage from './MainPage';
import PopularPage from './PopularPage';
import NotFoundPage from './NotFoundPage';

function checkWords(component, word, div) {
  it(`should render ${word} without crashing`, () => {
    const element = React.createElement(component);
    const html = renderToString(element);
    (html != null).should.be.true();
  });

  it(`should render function's HTML should have the word '${word}'`, function done() {
    const element = React.createElement(component);
    const html = renderToString(element);
    html.should.match(new RegExp(word));
  });
  it(`should have the ${div} div`, () => {
    const element = React.createElement(component);
    const html = renderToString(element);
    html.should.match(new RegExp(`<div[^>]*${div}`));
  });
}

describe('Page Components', function done1() {
  describe('BuilderPage', function done2() {
    checkWords(BuilderPage, 'Builder Page', 'page-builder');
  });

  describe('CreditsPage', function done2() {
    checkWords(CreditsPage, 'Credits Page', 'page-credits');
  });

  describe('LessonPage', function done2() {
    checkWords(LessonPage, 'Lesson Page', 'page-lesson');
  });
  describe('PopularPage', function done2() {
    checkWords(PopularPage, 'Popular Page', 'page-popular');
  });
  describe('NotFoundPage', function done2() {
    checkWords(NotFoundPage, 'Not Found', 'page-not-found');
  });

  describe('LessonPage', function done2() {
    it('should render LessonPage without crashing', () => {
      const html = renderToString(<LessonPage />);
      (html != null).should.be.true();
    });
    it("render function's HTML should have the word LessonPage", function done() {
      const html = renderToString(<LessonPage />);
      html.should.match(/Lesson Page/);
    });
    it('should have the page-lesson div', () => {
      const html = renderToString(<LessonPage />);
      html.should.match(/<div[^>]*page-lesson/);
    });
  });

  describe('MainPage', function done2() {
    it('should render MainPage without crashing', () => {
      const html = renderToString(<MainPage />);
      (html != null).should.be.true();
    });
    it("render function's HTML should have the word MainPage", function done() {
      const html = renderToString(<MainPage />);
      html.should.match(/Main Page/);
    });
    it('should have the page-main div', () => {
      const html = renderToString(<MainPage />);
      html.should.match(/<div[^>]*page-main/);
    });
  });

  describe('PopularPage', function done2() {
    it('should render PopularPage without crashing', () => {
      const html = renderToString(<PopularPage />);
      (html != null).should.be.true();
    });
    it("render function's HTML should have the word PopularPage", function done() {
      const html = renderToString(<PopularPage />);
      html.should.match(/Popular Page/);
    });
    it('should have the page-popular div', () => {
      const html = renderToString(<PopularPage />);
      html.should.match(/<div[^>]*page-popular/);
    });
  });
});
