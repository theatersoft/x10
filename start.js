'use strict'
require('@theatersoft/bus').default.start()
    .then(bus =>
        bus.proxy('Config').get()
            .then(config => {
                const
                    hostname = require('os').hostname(),
                    options = config.hosts
                        .find(({name}) => name === hostname).services
                        .find(({name}) => name === 'X10'),
                    service = new (require(options.module)[options.export])()
                service.start(options)
                process.on('SIGINT', () =>
                    service.stop().then(() => process.exit()))
            }))
