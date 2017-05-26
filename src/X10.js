import codec from './codec'
import {createStore, applyMiddleware} from 'redux'
import thunk from 'redux-thunk'
import {composeWithDevTools} from 'remote-redux-devtools'
import reducer from './reducer'
import bus from '@theatersoft/bus'
import {initDevices, off, rx, api} from './actions'

const dedup = (getState, _state = {}) => f => (_next = getState()) => {
    if (_next !== _state) {
        _state = _next
        f(_next)
    }
}

export class X10 {
    start ({name, config: {vid, pid, devices, remotedev}}) {
        this.name = name
        return bus.registerObject(name, this)
            .then(obj => {
                this.store = createStore(
                    reducer,
                    {devices: {}},
                    (remotedev && composeWithDevTools({name: 'X10', realtime: true, port: 6400, hostname: remotedev}) || (x => x))
                    (applyMiddleware(thunk.withExtraArgument({codec})))
                )
                this.store.dispatch(initDevices(devices))
                devices.forEach(dev => this.store.dispatch(off(dev.id)))
                this.store.subscribe(dedup(this.store.getState)(state =>
                    obj.signal('state', state)))
                codec.init({vid, pid})
                codec.on('rx', r => this.store.dispatch(rx(r)))
                const register = () => bus.proxy('Device').registerService(this.name)
                bus.registerListener(`Device.start`, register)
                bus.on('reconnect', register)
                register()
            })
    }

    stop () {
        return codec.close()
            .then(() => bus.unregisterObject(this.name))
    }

    send (cmd) {
        return codec.sendCommand(cmd)
    }

    dispatch (action) {
        return this.store.dispatch(api(action))
    }

    getState () {
        return this.store.getState()
    }
}
