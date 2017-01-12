import usb from 'usb'
import codec from './codec'
import store from './store'
import bus, {EventEmitter} from '@theatersoft/bus'
import {initDevices, command, off} from './actions'

export class X10 {
    start ({name, config: {vid, pid, devices}}) {
        this.name = name
        return bus.registerObject(name, this)
            .then(() => {
                store.dispatch(initDevices(devices))
                devices.forEach(dev => store.dispatch(off(dev.id)))
                store.subscribe(() =>
                    bus.signal(`/${name}.state`, store.getState()))
                codec.init({vid, pid})
                codec.on('rx', r =>
                    bus.signal(`/${name}.rx`, r))
                codec.on('action', store.dispatch.bind(store))
                const register = () => bus.proxy('Device').registerService(this.name)
                bus.registerListener(`/Device.started`, register)
                register()
            })
    }

    send (cmd) {
        return codec.sendCommand(cmd)
    }

    dispatch (action) {
        return this.send(command(action))
            .then(() =>
                store.dispatch(action))
    }

    getState () {
        return store.getState()
    }
}
