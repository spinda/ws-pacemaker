# ws-pacemaker

> Drop-in WebSocket ping/pong heartbeat handling for the [ws](https://github.com/websockets/ws)
> Node.js module

[![npm](https://img.shields.io/npm/v/ws-pacemaker)](https://npmjs.com/package/ws-pacemaker)
[![Build Status](https://img.shields.io/travis/spinda/ws-pacemaker/master)](https://travis-ci.org/spinda/ws-pacemaker)

## Overview

This module wraps around a
[`WebSocket.Server`](https://github.com/websockets/ws/blob/master/doc/ws.md#class-websocketserver)
to send periodic heartbeat pings (via
[`WebSocket#ping`](https://github.com/websockets/ws/blob/master/doc/ws.md#websocketpingdata-mask-callback))
to all connected clients,
and closes connections when a corresponding pong is not received (via
[`WebSocket#'pong'`](https://github.com/websockets/ws/blob/master/doc/ws.md#event-pong)) within an
acceptable timeout.

```js
'use strict';

const WebSocket = require('ws');
const Pacemaker = require('ws-pacemaker');
 
const server = new WebSocket.Server({ port: 8080 });

const pacemaker = new Pacemaker(server, {
  pingInterval: Pacemaker.defaultPingInterval,
  // ^ optional - default: send a ping every 25000 ms
  pongTimeout: Pacemaker.defaultPongTimeout,
  // ^ optional - default: terminate connections after 60000 ms without a pong
});

pacemaker.start();

//pacemaker.stop();
// ^ automatically called when the server closes
```

## Development

### Dependency Management

[Yarn](https://yarnpkg.com) is recommended for managing dependencies and development tooling.

### Code Formatting

Code formatting is handled by [prettierx](https://github.com/brodybits/prettierx), with a few
[options](.prettierrc.toml) tweaked.

To check that the code is correctly formatted:

```
yarn run check
```

To auto-format the code:

```
yarn run fmt
```

### Testing

This project uses [Jest](https://jestjs.io/) as its test framework.

To run all tests:

```
yarn run test
```

## License

Copyright (C) 2019-2020 Michael Smith &lt;michael@spinda.net&gt;

This program is free software: you can redistribute it and/or modify it under the terms of the
Mozilla Public License, version 2.0.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without
even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the Mozilla
Public License for more details.

You should have received a [copy](LICENSE) of the Mozilla Public License along with this program.
If not, see [https://www.mozilla.org/en-US/MPL/2.0/](https://www.mozilla.org/en-US/MPL/2.0/).

Helpful resources:

- [Mozilla's MPL-2.0 FAQ](https://www.mozilla.org/en-US/MPL/2.0/FAQ/)
- [MPL-2.0 on TLDRLegal](https://tldrlegal.com/license/mozilla-public-license-2.0-\(mpl-2\))

#### Contribution

Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion in
this work by you shall be licensed as above, without any additional terms or conditions.
