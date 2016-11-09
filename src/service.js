'use strict'

const
    bus = require('@theatersoft/bus').default,
    Controller = require('./controller')

bus.start().then(() => new Controller({name: 'x10'}))
