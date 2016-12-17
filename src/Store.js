import bus, {EventEmitter} from '@theatersoft/bus'
import {ON, on, OFF, off} from './actions'

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
        if (this.state !== last) {
            this.emit('change', this.state)
        }
    }
}

function reducer (state, action) {
    switch (action.type) {
    case ON:
        return {
            ...state,
            [action.id]: {value: true, action: off(action.id)}
        }
    case OFF:
        return {
            ...state,
            [action.id]: {value: false, action: on(action.id)}
        }
    }
    return state
}

export default class X10Store extends Store {
    constructor (devices = []) {
        super(reducer, {devices})
        devices.forEach(dev => {
            this.dispatch(off(dev.id))
        })
        console.log(this.state)
    }
}