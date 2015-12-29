dslink-javascript-amazon-dash
===

DSLink that listens for Amazon Dash button clicks. The Amazon Dash button is a $5 IoT
button by Amazon as an easy way to reorder repetitive household products from
Amazon.

Thanks to the work of the `node-dash-button` project, it's possible to set up
a Dash button to interact with other IoT devices (not Amazon.com), or in a
system like DSA.

The Amazon Dash link may or may not work on your system as an out-of-the-box
experience. This link, and the underlying node-dash-button library, intercepts
ARP packets from the Amazon Dash device to register a click. This is possible
due to the button only connecting to Wi-Fi when the button is pressed.

- The system the link is running on **must** be connected to Wi-Fi, not
Ethernet. This is due to Ethernet not receiving traffic from other devices on
the LAN, unlike devices connected to Wi-Fi.

- The system the link is running on must be connected to the same network as the
Dash button.

- If you get any errors to the effect of "Socket operation not supported", you
need to give your system's node.js executable (/usr/bin/node,
/usr/local/bin/node, etc) permission to read raw packets from the system.

- To setup your Dash button to not buy any products when you press the button,
simply exit the Amazon app at that stage of the setup process.

#### Once the link is running

Once the link is running, use the `/discoverButtons` action to find your button.
This action will log any device that is connecting to Wi-Fi, so make sure that
your Amazon Dash button is the only device connecting while trying to find it's
MAC address. Once you've found the MAC address, simply add it to the button list
with the `/createButton` action. You can then listen to the `/buttons/$button/lastPressed`
value for button clicks.
