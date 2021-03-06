import os from 'os'
import path from 'path'
const pkg = require('../package.json')

const defaultOptions: Options = {
  endpoint: 'https://api.maidenlane.xyz/v1',
  datasetsEndpoint: 'https://datasets.maidenlane.xyz/v1',
  cacheDir: path.join(os.tmpdir(), '.maidenlane-cache'),
  apiKey: '',
  _userAgent: `maidenlane-dev/${pkg.version} (+https://github.com/maidenlane-dev/maidenlane-node)`
}

let options: Options = { ...defaultOptions }

export function init(initOptions: Partial<Options> = {}) {
  options = { ...defaultOptions, ...initOptions }
}

export function getOptions() {
  return options as Readonly<Options>
}

type Options = {
  endpoint: string
  datasetsEndpoint: string
  cacheDir: string
  apiKey: string
  _userAgent: string
}
