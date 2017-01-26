import {ON, on, OFF, off} from './actions'
import {INIT_DEVICES} from './actions'

const reorder = arr => arr.map(({name, value, type, id}) => ({name, value, type, id}))
const index = arr => arr.reduce((o, e) => (o[e.id] = e, o), {})

export default function reducer (state, {type, devices, id}) {
    switch (type) {
    case INIT_DEVICES:
        return {
            ...state,
            devices: index(reorder(devices))
        }
    case ON:
    case OFF:
        const device = state.devices[id]
        if (device && type === ON !== device.value)
            return {
                ...state,
                devices: {
                    ...state.devices,
                    [id]: {...device, value: type === ON}
                }
            }
    }
    return state
}
