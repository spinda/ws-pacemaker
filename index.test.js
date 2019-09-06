// vim: set tw=99 ts=2 sw=2 et:

// Part of ws-pacemaker, a a drop-in module for WebSocket ping/pong heartbeat
// handling.

// Copyright (C) 2019 Michael Smith <michael@spinda.net>

// This Source Code Form is subject to the terms of the Mozilla Public License,
// v. 2.0. If a copy of the MPL was not distributed with this file, You can
// obtain one at http://mozilla.org/MPL/2.0/.

'use strict';

const WebSocket = require('ws');

const Pacemaker = require('.');

const pongTimeout = 1000;
const pingInterval = (Pacemaker.defaultPingInterval / Pacemaker.defaultPongTimeout) * pongTimeout;
const testDuration = pongTimeout * 3;

const makeTest = respondToPings => done => {
  const server = new WebSocket.Server({ port: 0 });
  const serverAddress = server.address();

  let clientSocket = null;

  server.on('connection', (serverSocket, request) => {
    setTimeout(() => {
      let caughtError = null;

      try {
        const expectedState = respondToPings ? WebSocket.OPEN : WebSocket.CLOSED;
        expect(serverSocket.readyState).toBe(expectedState);
        expect(clientSocket.readyState).toBe(expectedState);
      } catch (error) {
        caughtError = error;
      } finally {
        try {
          clientSocket.terminate();
        } catch (error) {
          caughtError = caughtError || error;
        }

        try {
          serverSocket.terminate();
        } catch (error) {
          caughtError = caughtError || error;
        }

        try {
          server.close();
        } catch (error) {
          caughtError = caughtError || error;
        }

        done();
        if (caughtError) {
          throw caughtError;
        }
      }
    }, testDuration);
  });

  const pacemaker = new Pacemaker(server, { pingInterval, pongTimeout });
  pacemaker.start();

  clientSocket = new WebSocket(`ws://127.0.0.1:${serverAddress.port}`);
  if (!respondToPings) {
    clientSocket.pong = () => {};
  }
};

test("a responsive WebSocket client doesn't get timed out", makeTest(true));
test('an unresponsive WebSocket client gets timed out', makeTest(false));
