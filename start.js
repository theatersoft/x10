'use strict'
require('@theatersoft/bus').setTime(true)
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
                Object.assign(options.config, config.configs[options.name])
                service.start(options)
                process.on('SIGINT', () =>
                    service.stop().then(() => process.exit()))
            }))
