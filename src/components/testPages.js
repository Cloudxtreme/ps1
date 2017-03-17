import React from 'react';
import 'should';
import { renderToString } from 'react-dom/server';
import BuilderPage from './BuilderPage';
import CreditsPage from './CreditsPage';
import LessonPage from './LessonPage';
import MainPage from './MainPage';
import PopularPage from './PopularPage';

describe('Page Components', function done1() {
  describe('BuilderPage', function done2() {
    it('should render BuilderPage without crashing', () => {
      const html = renderToString(<BuilderPage />);
      (html != null).should.be.true();
    });
    it("render function's HTML should have the word BuilderPage", function done() {
      const html = renderToString(<BuilderPage />);
      html.should.match(/Builder Page/);
    });
    it('should have the page-builder div', () => {
      const html = renderToString(<BuilderPage />);
      html.should.match(/<div[^>]*page-builder/);
    });
  });

  describe('CreditsPage', function done2() {
    it('should render CreditsPage without crashing', () => {
      const html = renderToString(<CreditsPage />);
      (html != null).should.be.true();
    });
    it("render function's HTML should have the word CreditsPage", function done() {
      const html = renderToString(<CreditsPage />);
      html.should.match(/Credits Page/);
    });
    it('should have the page-credits div', () => {
      const html = renderToString(<CreditsPage />);
      html.should.match(/<div[^>]*page-credits/);
    });
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
