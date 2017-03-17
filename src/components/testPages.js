import React from 'react';
import 'should';
import { renderToString } from 'react-dom/server';
import MainPage from './MainPage';

describe('Page Components', function done1() {
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
});
