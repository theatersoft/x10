'use strict'

const
    bus = require('@theatersoft/bus').default,
    service = {
        module: '@theatersoft/x10',
        export: 'x10',
        name: 'X10',
        config: {}
    }

bus.start().then(() =>
    new (require(service.module)[service.export])().start(service))
