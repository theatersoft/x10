'use strict'
require('@theatersoft/bus').default.start()
    .then(bus =>
        bus.proxy('Config').get()
            .then(config => {
                const
                    hostname = require('os').hostname(),
                    options = config.Hosts
                        .find(({Name}) => Name === hostname).services
                        .find(({name}) => name === 'X10'),
                    service = new (require(options.module)[options.export])()
                service.start(options)
            }))
