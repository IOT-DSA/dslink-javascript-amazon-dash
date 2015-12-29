'use strict';

require('babel-polyfill');

var _debug = require('dslink/debug');

var _events = require('events');

var _pcap = require('pcap');

var _pcap2 = _interopRequireDefault(_pcap);

var _util = require('./util');

var _structure = require('./structure');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// required for how we use the Amazon Dash library
process.env.NODE_ENV = 'test';
var dash_emitter = new _events.EventEmitter();

var link = new _debug.LinkProvider(process.argv.slice(2), 'amazon-dash-', {
  defaultNodes: _structure.defaultNodes,
  profiles: {
    createButton: function createButton(path, provider) {
      // params: macAddress
      return new _debug.SimpleActionNode(path, provider, function (node, params) {
        var macAddress = params.macAddress;

        var urlEncoded = (0, _util.urlEncode)(params.macAddress);
        link.addNode('/buttons/' + urlEncoded, (0, _structure.generateButton)(macAddress));
        link.save();
      });
    },
    deleteButton: function deleteButton(path, provider) {
      return new _debug.SimpleActionNode(path, provider, function (node, params) {
        link.removeNode('/buttons/' + (0, _util.urlEncode)(node.configs.$$addr));
        link.save();
      });
    },
    discoverButtons: function discoverButtons(path, provider) {
      // columns: timestamp, macAddress
      return new _debug.SimpleActionNode(path, provider, function (node, params) {
        var result = new _debug.AsyncTableResult();
        var listener = function listener(macAddress) {
          result.update([{
            timestamp: Date.now(),
            macAddress: macAddress
          }]);
        };

        dash_emitter.on('packet', listener);

        result.onClose = function (res) {
          dash_emitter.removeListener('packet', listener);
        };

        result.update([]);

        return result;
      });
    }
  }
});

link.init();

link.connect().then(function () {
  var _require = require('node-dash-button');

  var int_array_to_hex = _require.int_array_to_hex;
  var create_session = _require.create_session;

  var pcap_session = create_session();

  var just_emitted = {};
  pcap_session.on('packet', function (raw_packet) {
    var packet = _pcap2.default.decode.packet(raw_packet); //decodes the packet
    if (packet.payload.ethertype === 2054) {
      //ensures it is an arp packet
      var possible_dash = packet.payload.payload.sender_ha.addr; //getting the hardware address of the possible dash
      possible_dash = int_array_to_hex(possible_dash);

      var time = Date.now();

      if (just_emitted[possible_dash] && time - just_emitted[possible_dash] < 3000) return;
      just_emitted[possible_dash] = time;

      dash_emitter.emit('packet', possible_dash);

      var path = '/buttons/' + (0, _util.urlEncode)(possible_dash);
      if (link.provider.getNode(path) != null) {
        link.val(path + '/lastPressed', time);
        link.save();
      }
    }
  });
});