import { BookChange, DerivativeTicker, Exchange, FilterForExchange, Liquidation, Trade } from '../types'
import { Mapper, PendingTickerInfoHelper } from './mapper'
import { CircularBuffer } from '../handy'

// https://huobiapi.github.io/docs/spot/v1/en/#websocket-market-data
// https://github.com/huobiapi/API_Docs_en/wiki/WS_api_reference_en

export class HuobiTradesMapper implements Mapper<'huobi' | 'huobi-dm' | 'huobi-dm-swap' | 'huobi-dm-linear-swap', Trade> {
  private readonly _seenSymbols = new Set<string>()

  constructor(private readonly _exchange: Exchange) {}
  canHandle(message: HuobiDataMessage) {
    if (message.ch === undefined) {
      return false
    }
    return message.ch.endsWith('.trade.detail')
  }

  getFilters(symbols?: string[]) {
    symbols = normalizeSymbols(symbols)

    return [
      {
        channel: 'trade',
        symbols
      } as const
    ]
  }

  *map(message: HuobiTradeDataMessage, localTimestamp: Date): IterableIterator<Trade> {
    const symbol = message.ch.split('.')[1].toUpperCase()

    // always ignore first returned trade as it's a 'stale' trade, which has already been published before disconnect
    if (this._seenSymbols.has(symbol) === false) {
      this._seenSymbols.add(symbol)
      return
    }

    for (const huobiTrade of message.tick.data) {
      yield {
        type: 'trade',
        symbol,
        exchange: this._exchange,
        id: String(huobiTrade.tradeId !== undefined ? huobiTrade.tradeId : huobiTrade.id),
        price: huobiTrade.price,
        amount: huobiTrade.amount,
        side: huobiTrade.direction,
        timestamp: new Date(huobiTrade.ts),
        localTimestamp: localTimestamp
      }
    }
  }
}

export class HuobiBookChangeMapper implements Mapper<'huobi' | 'huobi-dm' | 'huobi-dm-swap' | 'huobi-dm-linear-swap', BookChange> {
  constructor(protected readonly _exchange: Exchange) {}

  canHandle(message: HuobiDataMessage) {
    if (message.ch === undefined) {
      return false
    }

    return message.ch.includes('.depth.')
  }

  getFilters(symbols?: string[]) {
    symbols = normalizeSymbols(symbols)

    return [
      {
        channel: 'depth',
        symbols
      } as const
    ]
  }

  *map(message: HuobiDepthDataMessage, localTimestamp: Date) {
    const symbol = message.ch.split('.')[1].toUpperCase()
    const isSnapshot = 'event' in message.tick ? message.tick.event === 'snapshot' : 'update' in message ? false : true
    const data = message.tick
    const bids = Array.isArray(data.bids) ? data.bids : []
    const asks = Array.isArray(data.asks) ? data.asks : []
    if (bids.length === 0 && asks.length === 0) {
      return
    }

    yield {
      type: 'book_change',
      symbol,
      exchange: this._exchange,
      isSnapshot,
      bids: bids.map(this._mapBookLevel),
      asks: asks.map(this._mapBookLevel),
      timestamp: new Date(message.ts),
      localTimestamp: localTimestamp
    } as const
  }

  private _mapBookLevel(level: HuobiBookLevel) {
    return { price: level[0], amount: level[1] }
  }
}

function isSnapshot(message: HuobiMBPDataMessage | HuobiMBPSnapshot): message is HuobiMBPSnapshot {
  return 'rep' in message
}

export class HuobiMBPBookChangeMapper implements Mapper<'huobi', BookChange> {
  protected readonly symbolToMBPInfoMapping: {
    [key: string]: MBPInfo
  } = {}

  constructor(protected readonly _exchange: Exchange) {}

  canHandle(message: any) {
    const channel = message.ch || message.rep
    if (channel === undefined) {
      return false
    }

    return channel.includes('.mbp.')
  }

  getFilters(symbols?: string[]) {
    symbols = normalizeSymbols(symbols)

    return [
      {
        channel: 'mbp',
        symbols
      } as const
    ]
  }

  *map(message: HuobiMBPDataMessage | HuobiMBPSnapshot, localTimestamp: Date) {
    const symbol = (isSnapshot(message) ? message.rep : message.ch).split('.')[1].toUpperCase()

    if (this.symbolToMBPInfoMapping[symbol] === undefined) {
      this.symbolToMBPInfoMapping[symbol] = {
        bufferedUpdates: new CircularBuffer<HuobiMBPDataMessage>(20)
      }
    }

    const mbpInfo = this.symbolToMBPInfoMapping[symbol]
    const snapshotAlreadyProcessed = mbpInfo.snapshotProcessed

    if (isSnapshot(message)) {
      const snapshotBids = message.data.bids.map(this._mapBookLevel)
      const snapshotAsks = message.data.asks.map(this._mapBookLevel)

      // if there were any depth updates buffered, let's proccess those by adding to or updating the initial snapshot
      // when prevSeqNum >= snapshot seqNum
      for (const update of mbpInfo.bufferedUpdates.items()) {
        if (update.tick.prevSeqNum < message.data.seqNum) {
          continue
        }

        const bookChange = this._mapMBPUpdate(update, symbol, localTimestamp)
        if (bookChange !== undefined) {
          for (const bid of bookChange.bids) {
            const matchingBid = snapshotBids.find((b) => b.price === bid.price)
            if (matchingBid !== undefined) {
              matchingBid.amount = bid.amount
            } else {
              snapshotBids.push(bid)
            }
          }

          for (const ask of bookChange.asks) {
            const matchingAsk = snapshotAsks.find((a) => a.price === ask.price)
            if (matchingAsk !== undefined) {
              matchingAsk.amount = ask.amount
            } else {
              snapshotAsks.push(ask)
            }
          }
        }
      }

      mbpInfo.snapshotProcessed = true

      yield {
        type: 'book_change',
        symbol,
        exchange: this._exchange,
        isSnapshot: true,
        bids: snapshotBids,
        asks: snapshotAsks,
        timestamp: new Date(message.ts),
        localTimestamp
      } as const
    } else {
      mbpInfo.bufferedUpdates.append(message)

      if (snapshotAlreadyProcessed) {
        // snapshot was already processed let's map the mbp message as normal book_change
        const update = this._mapMBPUpdate(message, symbol, localTimestamp)
        if (update !== undefined) {
          yield update
        }
      }
    }
  }

  private _mapMBPUpdate(message: HuobiMBPDataMessage, symbol: string, localTimestamp: Date) {
    const bids = Array.isArray(message.tick.bids) ? message.tick.bids : []
    const asks = Array.isArray(message.tick.asks) ? message.tick.asks : []

    if (bids.length === 0 && asks.length === 0) {
      return
    }

    return {
      type: 'book_change',
      symbol,
      exchange: this._exchange,
      isSnapshot: false,
      bids: bids.map(this._mapBookLevel),
      asks: asks.map(this._mapBookLevel),
      timestamp: new Date(message.ts),
      localTimestamp: localTimestamp
    } as const
  }

  private _mapBookLevel(level: HuobiBookLevel) {
    return { price: level[0], amount: level[1] }
  }
}

function normalizeSymbols(symbols?: string[]) {
  if (symbols !== undefined) {
    return symbols.map((s) => {
      // huobi-dm and huobi-dm-swap expect symbols to be upper cased
      if (s.includes('_') || s.includes('-')) {
        return s
      }
      // huobi global expects lower cased symbols
      return s.toLowerCase()
    })
  }
  return
}

export class HuobiDerivativeTickerMapper implements Mapper<'huobi-dm' | 'huobi-dm-swap' | 'huobi-dm-linear-swap', DerivativeTicker> {
  private readonly pendingTickerInfoHelper = new PendingTickerInfoHelper()

  constructor(private readonly _exchange: Exchange) {}

  canHandle(message: any) {
    if (message.ch !== undefined) {
      return message.ch.includes('.basis.') || message.ch.endsWith('.open_interest')
    }

    if (message.op === 'notify' && message.topic !== undefined) {
      return message.topic.endsWith('.funding_rate')
    }

    return false
  }

  getFilters(symbols?: string[]) {
    const filters: FilterForExchange['huobi-dm-swap'][] = [
      {
        channel: 'basis',
        symbols
      },
      {
        channel: 'open_interest',
        symbols
      }
    ]

    if (this._exchange === 'huobi-dm-swap' || this._exchange === 'huobi-dm-linear-swap') {
      filters.push({
        channel: 'funding_rate',
        symbols
      })
    }

    return filters
  }

  *map(
    message: HuobiBasisDataMessage | HuobiFundingRateNotification | HuobiOpenInterestDataMessage,
    localTimestamp: Date
  ): IterableIterator<DerivativeTicker> {
    if ('op' in message) {
      // handle funding_rate notification message
      const fundingInfo = message.data[0]
      const pendingTickerInfo = this.pendingTickerInfoHelper.getPendingTickerInfo(fundingInfo.contract_code, this._exchange)

      pendingTickerInfo.updateFundingRate(Number(fundingInfo.funding_rate))
      pendingTickerInfo.updateFundingTimestamp(new Date(Number(fundingInfo.settlement_time)))
      pendingTickerInfo.updatePredictedFundingRate(Number(fundingInfo.estimated_rate))
      pendingTickerInfo.updateTimestamp(new Date(message.ts))

      if (pendingTickerInfo.hasChanged()) {
        yield pendingTickerInfo.getSnapshot(localTimestamp)
      }
    } else {
      const symbol = message.ch.split('.')[1]
      const pendingTickerInfo = this.pendingTickerInfoHelper.getPendingTickerInfo(symbol, this._exchange)

      // basis message
      if ('tick' in message) {
        pendingTickerInfo.updateIndexPrice(Number(message.tick.index_price))
        pendingTickerInfo.updateLastPrice(Number(message.tick.contract_price))
      } else {
        // open interest message
        const openInterest = message.data[0]
        pendingTickerInfo.updateOpenInterest(Number(openInterest.volume))
      }

      pendingTickerInfo.updateTimestamp(new Date(message.ts))

      if (pendingTickerInfo.hasChanged()) {
        yield pendingTickerInfo.getSnapshot(localTimestamp)
      }
    }
  }
}

export class HuobiLiquidationsMapper implements Mapper<'huobi-dm' | 'huobi-dm-swap' | 'huobi-dm-linear-swap', Liquidation> {
  private readonly _contractCodeToSymbolMap: Map<string, string> = new Map()
  private readonly _contractTypesSuffixes = { this_week: 'CW', next_week: 'NW', quarter: 'CQ', next_quarter: 'NQ' }

  constructor(private readonly _exchange: Exchange) {}

  canHandle(message: HuobiLiquidationOrder | HuobiContractInfo) {
    if (message.op !== 'notify') {
      return false
    }

    if (this._exchange === 'huobi-dm' && message.topic.endsWith('.contract_info')) {
      this._updateContractCodeToSymbolMap(message as HuobiContractInfo)
    }

    return message.topic.endsWith('.liquidation_orders')
  }

  getFilters(symbols?: string[]) {
    if (this._exchange === 'huobi-dm') {
      // huobi-dm for liquidations requires prividing different symbols which are indexes names for example 'BTC' or 'ETH'
      // not futures names like 'BTC_NW'
      // see https://huobiapi.github.io/docs/dm/v1/en/#subscribe-liquidation-order-data-no-authentication-sub

      if (symbols !== undefined) {
        symbols = symbols.map((s) => s.split('_')[0])
      }

      // we also need to subscribe to contract_info which will provide us information that will allow us to map
      // liquidation message symbol and contract code to symbols we expect (BTC_NW etc)

      return [
        {
          channel: 'liquidation_orders',
          symbols
        } as const,
        {
          channel: 'contract_info',
          symbols
        } as const
      ]
    } else {
      // huobi dm swap liquidations messages provide correct symbol & contract code
      return [
        {
          channel: 'liquidation_orders',
          symbols
        } as const
      ]
    }
  }

  private _updateContractCodeToSymbolMap(message: HuobiContractInfo) {
    for (const item of message.data) {
      this._contractCodeToSymbolMap.set(item.contract_code, `${item.symbol}_${this._contractTypesSuffixes[item.contract_type]}`)
    }
  }

  *map(message: HuobiLiquidationOrder, localTimestamp: Date): IterableIterator<Liquidation> {
    for (const huobiLiquidation of message.data) {
      let symbol = huobiLiquidation.contract_code
      // huobi-dm returns index name as a symbol, not future alias, so we need to map it here
      if (this._exchange === 'huobi-dm') {
        const futureAliasSymbol = this._contractCodeToSymbolMap.get(huobiLiquidation.contract_code)
        if (futureAliasSymbol === undefined) {
          continue
        }

        symbol = futureAliasSymbol
      }

      yield {
        type: 'liquidation',
        symbol,
        exchange: this._exchange,
        id: undefined,
        price: huobiLiquidation.price,
        amount: huobiLiquidation.volume,
        side: huobiLiquidation.direction,
        timestamp: new Date(huobiLiquidation.created_at),
        localTimestamp: localTimestamp
      }
    }
  }
}

type HuobiDataMessage = {
  ch: string
}

type HuobiTradeDataMessage = HuobiDataMessage & {
  tick: {
    data: {
      id: number
      tradeId?: number
      price: number
      amount: number
      direction: 'buy' | 'sell'
      ts: number
    }[]
  }
}

type HuobiBookLevel = [number, number]

type HuobiDepthDataMessage = HuobiDataMessage &
  (
    | {
        update?: boolean
        ts: number
        tick: {
          bids: HuobiBookLevel[] | null
          asks: HuobiBookLevel[] | null
        }
      }
    | {
        ts: number
        tick: {
          bids?: HuobiBookLevel[] | null
          asks?: HuobiBookLevel[] | null
          event: 'snapshot' | 'update'
        }
      }
  )

type HuobiBasisDataMessage = HuobiDataMessage & {
  ts: number
  tick: {
    index_price: string
    contract_price: string
  }
}

type HuobiFundingRateNotification = {
  op: 'notify'
  topic: string
  ts: number
  data: {
    settlement_time: string
    funding_rate: string
    estimated_rate: string
    contract_code: string
  }[]
}

type HuobiOpenInterestDataMessage = HuobiDataMessage & {
  ts: number
  data: {
    volume: number
  }[]
}

type HuobiMBPDataMessage = HuobiDataMessage & {
  ts: number
  tick: {
    bids?: HuobiBookLevel[] | null
    asks?: HuobiBookLevel[] | null
    seqNum: number
    prevSeqNum: number
  }
}

type HuobiMBPSnapshot = {
  ts: number
  rep: string
  data: {
    bids: HuobiBookLevel[]
    asks: HuobiBookLevel[]
    seqNum: number
  }
}

type MBPInfo = {
  bufferedUpdates: CircularBuffer<HuobiMBPDataMessage>
  snapshotProcessed?: boolean
}

type HuobiLiquidationOrder = {
  op: 'notify'
  topic: string
  ts: number
  data: {
    symbol: string
    contract_code: string
    direction: 'buy' | 'sell'
    offset: string
    volume: number
    price: number
    created_at: number
  }[]
}

type HuobiContractInfo = {
  op: 'notify'
  topic: string
  ts: number
  data: {
    symbol: string
    contract_code: string
    contract_type: 'this_week' | 'next_week' | 'quarter' | 'next_quarter'
  }[]
}
