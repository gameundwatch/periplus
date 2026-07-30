#!/usr/bin/env node

const test = require('node:test');
const assert = require('node:assert');

const { tag } = require('./periplus-statusline.js');

const plain = (s) => s.replace(/\[[0-9;]*m/g, '');
const warned = (s) => s.includes('[38;5;179m');

test('a drained log is the bare tag', () => {
  assert.strictEqual(plain(tag(0, 0, 10)), '[PERIPLUS]');
});

test('both counts appear, log first', () => {
  assert.strictEqual(plain(tag(3, 2, 10)), '[PERIPLUS:3!2]');
});

test('a zero count is omitted rather than shown as 0', () => {
  assert.strictEqual(plain(tag(0, 2, 10)), '[PERIPLUS!2]');
  assert.strictEqual(plain(tag(3, 0, 10)), '[PERIPLUS:3]');
});

test('the threshold turns the tag amber', () => {
  assert.ok(!warned(tag(10, 0, 10)), 'at the threshold is not yet over it');
  assert.ok(warned(tag(11, 0, 10)));
});

test('unfiltered pre-comments do not warn on their own', () => {
  assert.ok(!warned(tag(0, 99, 10)));
});
