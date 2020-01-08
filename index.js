// vim: set tw=99 ts=2 sw=2 et:

// Part of ws-pacemaker, a a drop-in module for WebSocket ping/pong heartbeat
// handling.

// Copyright (C) 2019-2020 Michael Smith <michael@spinda.net>

// This Source Code Form is subject to the terms of the Mozilla Public License,
// v. 2.0. If a copy of the MPL was not distributed with this file, You can
// obtain one at http://mozilla.org/MPL/2.0/.

'use strict';

class Pacemaker {
  constructor (
    server,
    {
      pingInterval = Pacemaker.defaultPingInterval,
      pongTimeout = Pacemaker.defaultPongTimeout
    } = {}
  ) {
    this._server = server;
    this._pingInterval = pingInterval;
    this._pongTimeout = pongTimeout;

    this._serverCloseEventListener = null;

    this._sendPingsIntervalHandle = null;
    this._checkPongsIntervalHandle = null;

    this._pongEventListenerSymbol = Symbol('Pacemaker#_pongEventListenerSymbol');
    this._lastPongTimestampSymbol = Symbol('Pacemaker#_lastPongTimestampSymbol');
  }

  start () {
    this.stop();

    if (!this._server.address()) {
      // Server is already closed.
      return;
    }

    this._serverCloseEventListener = this.stop.bind(this);
    this._server.once('close', this._serverCloseEventListener);

    this._sendPingsIntervalHandle = setInterval(this._sendPings.bind(this), this._pingInterval);
    this._checkPongsIntervalHandle = setInterval(this._checkPongs.bind(this), this._pongTimeout);
  }

  stop () {
    clearInterval(this._sendPingsIntervalHandle);
    clearInterval(this._checkPongsIntervalHandle);

    this._sendPingsIntervalHandle = null;
    this._checkPongsIntervalHandle = null;

    if (this._serverCloseEventListener != null) {
      this._server.off('close', this._serverCloseEventListener);
      this._serverCloseEventListener = null;
    }

    for (const client of this._server.clients) {
      if (client.hasOwnProperty(this._pongEventListenerSymbol)) {
        client.off('pong', client[this._pongEventListenerSymbol]);
        delete client[this._pongEventListenerSymbol];
      }

      delete client[this._lastPongTimestampSymbol];
    }
  }

  _sendPings () {
    for (const client of this._server.clients) {
      client.ping();
    }
  }

  _checkPongs () {
    const timeoutThreshold = Date.now() - this._pongTimeout;

    for (const client of this._server.clients) {
      if (client.hasOwnProperty(this._pongEventListenerSymbol)) {
        if (
          !client.hasOwnProperty(this._lastPongTimestampSymbol) ||
          client[this._lastPongTimestampSymbol] < timeoutThreshold
        ) {
          client.terminate();
        }
      } else {
        client[this._pongEventListenerSymbol] = this._onClientPong.bind(this, client);
        client.on('pong', client[this._pongEventListenerSymbol]);
      }
    }
  }

  _onClientPong (client, data) {
    client[this._lastPongTimestampSymbol] = Date.now();
  }
}

Object.defineProperty(Pacemaker, 'defaultPingInterval', {
  configurable: false,
  enumerable: true,
  value: 25000,
  writable: false
});

Object.defineProperty(Pacemaker, 'defaultPongTimeout', {
  configurable: false,
  enumerable: true,
  value: 60000,
  writable: false
});

module.exports = Pacemaker;
