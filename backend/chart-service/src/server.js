// src/server.js
const express = require('express');
const http = require('http');
const axios = require('axios');
const WebSocket = require('ws');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' } // dev only; hạn chế origin trong production
});

const BINANCE_REST = 'https://api.binance.com/api/v3/klines';
const BINANCE_WS_BASE = 'wss://stream.binance.com:9443/ws/';

// store per-room subscription { ws, clients:Set }
const subs = new Map();

/**
 * REST endpoint: /history?symbol=BTCUSDT&interval=1m&limit=500
 * returns [{time, open, high, low, close, volume}, ...]
 */
app.get('/history', async (req, res) => {
  try {
    const symbol = (req.query.symbol || 'BTCUSDT').toUpperCase();
    const interval = req.query.interval || '1m';
    const limit = req.query.limit ? parseInt(req.query.limit) : 500;
    const resp = await axios.get(BINANCE_REST, {
      params: { symbol, interval, limit }
    });
    const out = resp.data.map(k => ({
      time: Math.floor(k[0] / 1000), // seconds
      open: parseFloat(k[1]),
      high: parseFloat(k[2]),
      low: parseFloat(k[3]),
      close: parseFloat(k[4]),
      volume: parseFloat(k[5])
    }));
    res.json(out);
  } catch (err) {
    console.error('history error', err?.message || err);
    res.status(500).json({ error: err?.message || 'fetch error' });
  }
});

/**
 * Helper: start a raw WS to Binance for a given symbol+interval and broadcast to a socket.io room
 * roomName use format SYMBOL@INTERVAL (e.g. BTCUSDT@1m)
 */
function startBinanceStream(symbol, interval, roomName) {
  const streamName = `${symbol.toLowerCase()}@kline_${interval}`;
  const wsUrl = BINANCE_WS_BASE + streamName;
  console.log('starting ws', wsUrl, 'for room', roomName);
  const ws = new WebSocket(wsUrl);

  ws.on('open', () => console.log('binance ws open', streamName));
  ws.on('message', msg => {
    try {
      const parsed = JSON.parse(msg.toString());
      // for raw stream, payload has kline in parsed.k
      const k = parsed.k;
      if (!k) return;
      const payload = {
        symbol: parsed.s || symbol.toUpperCase(),
        interval: k.i,
        startTime: k.t, // ms
        open: parseFloat(k.o),
        high: parseFloat(k.h),
        low: parseFloat(k.l),
        close: parseFloat(k.c),
        volume: parseFloat(k.v),
        isFinal: !!k.x
      };
      // emit to clients in the room
      io.to(roomName).emit('kline', payload);
    } catch (e) {
      console.warn('ws parse err', e);
    }
  });

  ws.on('error', e => console.warn('binance ws error', e.message || e));
  ws.on('close', () => {
    console.log('binance ws closed', streamName);
    // cleanup map (will be restarted if clients re-subscribe)
    const s = subs.get(roomName);
    if (s && s.ws === ws) subs.delete(roomName);
  });

  subs.set(roomName, { ws, clients: new Set() });
}

/**
 * socket.io handling
 * client should emit: {type:'subscribe', symbol:'BTCUSDT', interval:'1m'}
 */
io.on('connection', socket => {
  console.log('client connected', socket.id);

  socket.on('subscribe', ({ symbol, interval = '1m' }) => {
    if (!symbol) return;
    const U = symbol.toUpperCase();
    const room = `${U}@${interval}`;
    socket.join(room);
    let sub = subs.get(room);
    if (!sub) {
      // start binance ws for this room
      startBinanceStream(U, interval, room);
      sub = subs.get(room);
    }
    sub.clients.add(socket.id);
    console.log(`${socket.id} subscribed to ${room} (clients=${sub.clients.size})`);
  });

  socket.on('unsubscribe', ({ symbol, interval = '1m' }) => {
    if (!symbol) return;
    const U = symbol.toUpperCase();
    const room = `${U}@${interval}`;
    socket.leave(room);
    const sub = subs.get(room);
    if (sub) {
      sub.clients.delete(socket.id);
      if (sub.clients.size === 0) {
        // close underlying ws to save resources
        try { sub.ws.close(); } catch (e) {}
        subs.delete(room);
        console.log('closed stream', room);
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('client disconnect', socket.id);
    // remove from all subs
    for (const [room, sub] of subs) {
      if (sub.clients.has(socket.id)) {
        sub.clients.delete(socket.id);
        if (sub.clients.size === 0) {
          try { sub.ws.close(); } catch (e) {}
          subs.delete(room);
          console.log('closed stream after disconnect', room);
        }
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log('Server listening on', PORT));
