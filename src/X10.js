import usb from 'usb'
import codec from './codec'
import bus, {EventEmitter} from '@theatersoft/bus'

export class X10 {
    start ({name, config: {vid, pid}}) {
        return bus.registerObject(name, this)
            .then(() => {
                codec.init({vid, pid})
                codec.on('rx', r =>
                    bus.signal(`${name}.rx`, r))
            })
    }
}


