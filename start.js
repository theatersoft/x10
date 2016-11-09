'use strict'
const
    bus = require('@theatersoft/bus').default,
    service = {
        module: '@theatersoft/x10',
        export: 'X10',
        name: 'X10',
        config: {vid: 0x0bc7, pid: 0x0001}
    }

bus.start().then(() =>
    new (require(service.module)[service.export])().start(service))