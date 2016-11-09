'use strict'

const
    usb = require('usb'),
    x10 = require('./x10'),
    {default: bus, EventEmitter} = require('@theatersoft/bus')

class Controller extends EventEmitter {
    constructor ({vid, pid, name}) {
        super()
        bus.register(`${name}.control`, this)
        // TODO async bus register cannot be in ctor
        x10.init({vid, pid})
        //x10.on('rx', r => busObject.emitter.emit(`.rx`, r))
        x10.on('rx', r => this.emit('rx', r))
    }
}

module.exports = Controller
