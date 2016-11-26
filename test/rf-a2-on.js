'use strict'

const
    {default: bus, proxy} = require('@theatersoft/bus'),
    X10 = proxy('X10')

bus.start().then(() =>
    X10.send('RF A2 ON')
)
