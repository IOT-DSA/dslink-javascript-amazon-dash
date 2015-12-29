'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.generateButton = generateButton;
var defaultNodes = exports.defaultNodes = {
  buttons: {},
  createButton: {
    $name: 'Create Button',
    $is: 'createButton',
    $invokable: 'write',
    $params: [{
      name: 'macAddress',
      type: 'string'
    }]
  },
  discoverButtons: {
    $name: 'Discover Buttons',
    $is: 'discoverButtons',
    $invokable: 'write',
    $result: 'stream',
    $columns: [{
      name: 'timestamp',
      type: 'number'
    }, {
      name: 'macAddress',
      type: 'string'
    }]
  }
};

function generateButton(addr) {
  return {
    $name: addr,
    lastPressed: {
      $type: 'number',
      '?value': -1
    },
    deleteButton: {
      $name: 'Delete Button',
      $is: 'deleteButton',
      $invokable: 'write',
      $$addr: addr
    }
  };
}