'use strict'

const
    bus = require('@theatersoft/bus').default,
    Serial = require('@theatersoft/serial')

bus.start().then(() => new Serial())