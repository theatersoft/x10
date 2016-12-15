import bus, {EventEmitter} from '@theatersoft/bus'

export class Store extends EventEmitter {
    constructor (reducer, initial = {}) {
        super()
        this.state = initial
        this.reducer = reducer
    }

    getState () {
        return this.state
    }

    dispatch (action) {
        const last = this.state
        this.state = this.reducer(last, action)
        if (this.state !== last)
            this.emit('change')
    }
}

function reduce(state, action) {
    switch (action.type) {
    case ON:
    case OFF:
        command(action)
        return {...state, [action.id]: action.type === ON} // !!! id as key in state
    }
    return state //TODO
}

function command(action) {
    return `RF ${action.addr} ${action.type}`
}

export default class X10Store extends Store {
    constructor (devices = []) {
        super(reduce, {devices: devices.map(d => ({...d, on: false}))}) // TODO can't read start state
    }
}