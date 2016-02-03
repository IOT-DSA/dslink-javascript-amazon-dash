import "babel-polyfill";

import { LinkProvider, SimpleActionNode, AsyncTableResult } from 'dslink/debug';
import { EventEmitter } from 'events';
import pcap from 'pcap';

import { urlEncode } from './util';
import { defaultNodes, generateButton } from './structure';

// required for how we use the Amazon Dash library
process.env.NODE_ENV = 'test';
const dash_emitter = new EventEmitter();

const link = new LinkProvider(process.argv.slice(2), 'amazon-dash-', {
  defaultNodes,
  profiles: {
    createButton(path, provider) {
      // params: macAddress
      return new SimpleActionNode(path, provider, (params, node) => {
        let { macAddress } = params;
        const urlEncoded = urlEncode(params.macAddress);
        link.addNode(`/buttons/${urlEncoded}`, generateButton(macAddress));
        link.save();
      });
    },
    deleteButton(path, provider) {
      return new SimpleActionNode(path, provider, (params, node) => {
        link.removeNode(`/buttons/${urlEncode(node.configs.$$addr)}`);
        link.save();
      });
    },
    discoverButtons(path, provider) {
      // columns: timestamp, macAddress
      return new SimpleActionNode(path, provider, (params, node) => {
        const result = new AsyncTableResult();
        const listener = (macAddress) => {
          result.update([{
            timestamp: Date.now(),
            macAddress
          }]);
        };

        dash_emitter.on('packet', listener);

        result.onClose = (res) => {
          dash_emitter.removeListener('packet', listener);
        };

        result.update([]);

        return result;
      });
    }
  }
});

link.init();

link.connect().then(() => {
  const { int_array_to_hex, create_session } = require('node-dash-button');
  const pcap_session = create_session();

  const just_emitted = {};
  pcap_session.on('packet', (raw_packet) => {
    const packet = pcap.decode.packet(raw_packet); //decodes the packet
    if(packet.payload.ethertype === 2054) { //ensures it is an arp packet
      let possible_dash = packet.payload.payload.sender_ha.addr; //getting the hardware address of the possible dash
      possible_dash = int_array_to_hex(possible_dash);

      const time = Date.now();

      if(just_emitted[possible_dash] && (time - just_emitted[possible_dash]) < 3000)
        return;
      just_emitted[possible_dash] = time;

      dash_emitter.emit('packet', possible_dash);

      const path = `/buttons/${urlEncode(possible_dash)}`;
      if(link.provider.getNode(path) != null) {
        link.val(`${path}/lastPressed`, time);
        link.save();
      }
    }
  });
});
