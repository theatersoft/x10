import usb from 'usb'
import codec from './codec'
import Store from './Store'
import bus, {EventEmitter} from '@theatersoft/bus'
import {command} from './actions'

export class X10 {
    start ({name, config: {vid, pid, devices}}) {
        return bus.registerObject(name, this)
            .then(() => {
                this.store = new Store(devices)
                    .on('change', state =>
                        bus.signal(`/${name}.change`, state))
                codec.init({vid, pid})
                codec.on('rx', r =>
                    bus.signal(`/${name}.rx`, r))
                codec.on('action', this.dispatch.bind(this))
            })
    }

    send (cmd) {
        return codec.sendCommand(cmd)
    }

    dispatch (action) {
        return this.send(command(action))
            .then(() =>
                this.store.dispatch(action))
    }

    getState () {
        return this.store.getState()
    }
}



