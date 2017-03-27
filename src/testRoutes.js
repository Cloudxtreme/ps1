import React from 'react';
import express from 'express';
import request from 'supertest';

const app = express();

function gets(page) {
  describe(`GET ${page}`, () => {
    it('responds with status code 200', function done() {
      request(app)
      .get('/')
      .expect(200, done);
    });
  });
}

gets('/');
gets('/credits');
gets('/lesson');
gets('/popular');
gets('/builder');
