'use strict'
const
    bus = require('@theatersoft/bus').default,
    options = {
        module: '@theatersoft/x10',
        export: 'X10',
        name: 'X10',
        config: {
            vid: 0x0bc7, pid: 0x0001, devices: [
                {
                    "name": "Test",
                    "id": "A1"
                }
            ]
        }
    },
    service = new (require(options.module)[options.export])()


bus.start().then(() =>
    service.start(options))