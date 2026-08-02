#!/usr/bin/env node

const test = require('node:test');
const assert = require('node:assert');

const { tag } = require('./periplus-statusline.js');

const plain = (s) => s.replace(/\x1b\[[0-9;]*m/g, '');
const colour = (s) => (s.match(/\x1b\[[0-9;]+m/) || [])[0];

test('an empty log is the bare tag', () => {
  assert.strictEqual(plain(tag(0, 0)), '[PERIPLUS]');
});

test('both counts appear, log first', () => {
  assert.strictEqual(plain(tag(3, 2)), '[PERIPLUS:3!2]');
});

test('a zero count is omitted rather than shown as 0', () => {
  assert.strictEqual(plain(tag(0, 2)), '[PERIPLUS!2]');
  assert.strictEqual(plain(tag(3, 0)), '[PERIPLUS:3]');
});

test('the counts are line counts, and neither size changes the colour', () => {
  assert.strictEqual(colour(tag(999, 0)), colour(tag(0, 0)));
  assert.strictEqual(colour(tag(0, 99)), colour(tag(0, 0)));
});
