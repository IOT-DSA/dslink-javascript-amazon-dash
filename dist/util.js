'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.urlEncode = urlEncode;
var bannedChars = {
  '%': '%25',
  '.': '%2E',
  '/': '%2F',
  '\\': '%5C',
  '?': '%3F',
  '*': '%2A',
  ':': '%3A',
  '|': '%7C',
  '<': '%3C',
  '>': '%3E',
  '$': '%24',
  '@': '%40',
  ',': '%2C'
};

function urlEncode(string) {
  Object.keys(bannedChars).forEach(function (char) {
    string = string.split(char).join(bannedChars[char]);
  });

  return string;
}