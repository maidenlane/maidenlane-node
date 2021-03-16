# maidenlane-dev

## overview

```javascript
const { replayNormalized, normalizeTrades, normalizeBookChanges } = require('maidenlane-dev')

const messages = replayNormalized(
  {
    exchange: 'bitmex',
    symbols: ['XBTUSD', 'ETHUSD'],
    from: '2019-05-01',
    to: '2019-05-02'
  },
  normalizeTrades,
  normalizeBookChanges
)

for await (const message of messages) {
  console.log(message)
}
```


## Installation

Requires Node.js v12+ installed.

```bash
npm install maidenlane-dev --save
```

<br/>
<br/>

### example 2


```javascript
const maidenlane = require('maidenlane-dev')
const { streamNormalized, normalizeBookChanges, combine, compute, computeBookSnapshots } = maidenlane

const exchangesToStream = [
  { exchange: 'bitmex', symbols: ['XBTUSD'] },
  { exchange: 'deribit', symbols: ['BTC-PERPETUAL'] },
  { exchange: 'cryptofacilities', symbols: ['PI_XBTUSD'] }
]
// for each specified exchange call streamNormalized for it
// so we have multiple real-time streams for all specified exchanges
const realTimeStreams = exchangesToStream.map((e) => {
  return streamNormalized(e, normalizeBookChanges)
})

// combine all real-time message streams into one
const messages = combine(...realTimeStreams)

// create book snapshots with depth1 that are produced
// every time best bid/ask info is changed
// effectively computing real-time quotes
const realTimeQuoteComputable = computeBookSnapshots({
  depth: 1,
  interval: 0,
  name: 'realtime_quote'
})

// compute real-time quotes for combines real-time messages
const messagesWithQuotes = compute(messages, realTimeQuoteComputable)

const spreads = {}

// print spreads info every 100ms
setInterval(() => {
  console.clear()
  console.log(spreads)
}, 100)

// update spreads info real-time
for await (const message of messagesWithQuotes) {
  if (message.type === 'book_snapshot') {
    spreads[message.exchange] = {
      spread: message.asks[0].price - message.bids[0].price,
      bestBid: message.bids[0],
      bestAsk: message.asks[0]
    }
  }
}
```

### example 3

```javascript
const maidenlane = require('maidenlane-dev')
const { replayNormalized, streamNormalized, normalizeTrades, compute, computeTradeBars } = maidenlane

const historicalMessages = replayNormalized(
  {
    exchange: 'bitmex',
    symbols: ['XBTUSD'],
    from: '2019-08-01',
    to: '2019-08-02'
  },
  normalizeTrades
)

const realTimeMessages = streamNormalized(
  {
    exchange: 'bitmex',
    symbols: ['XBTUSD']
  },
  normalizeTrades
)

async function produceVolumeBasedTradeBars(messages) {
  const withVolumeTradeBars = compute(
    messages,
    computeTradeBars({
      kind: 'volume',
      interval: 100 * 1000 // aggregate by 100k contracts volume
    })
  )

  for await (const message of withVolumeTradeBars) {
    if (message.type === 'trade_bar') {
      console.log(message.name, message)
    }
  }
}

await produceVolumeBasedTradeBars(historicalMessages)

// or for real time data
//  await produceVolumeBasedTradeBars(realTimeMessages)
```

[![Try this code live on RunKit](https://img.shields.io/badge/-Try%20this%20code%20live%20on%20RunKit-c?color=5558be)](https://runkit.com/thad/maidenlane-dev-seamless-switching-between-real-time-streaming-and-historical-market-data-replay)

<br/>

### Stream real-time market data in exchange native data format

```javascript
const { stream } = require('maidenlane-dev')

const messages = stream({
  exchange: 'bitmex',
  filters: [
    { channel: 'trade', symbols: ['XBTUSD'] },
    { channel: 'orderBookL2', symbols: ['XBTUSD'] }
  ]
})

for await (const message of messages) {
  console.log(message)
}
```
### example 4

```javascript
const { replay } = require('maidenlane-dev')

const messages = replay({
  exchange: 'bitmex',
  filters: [
    { channel: 'trade', symbols: ['XBTUSD'] },
    { channel: 'orderBookL2', symbols: ['XBTUSD'] }
  ],
  from: '2019-05-01',
  to: '2019-05-02'
})

for await (const message of messages) {
  console.log(message)
}
```

