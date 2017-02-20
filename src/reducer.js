import {ON, on, OFF, off} from './actions'
import {INIT_DEVICES} from './actions'

const reorder = arr => arr.map(({name, value, type, id}) => ({name, value, type, id}))
const index = arr => arr.reduce((o, e) => (o[e.id] = e, o), {})

export default function reducer (state, action) {
    const {type} = action
    switch (type) {
    case INIT_DEVICES:
        const {devices} = action
        return {
            ...state,
            devices: index(reorder(devices))
        }
    case ON:
    case OFF:
        const
            {id, time} = action,
            device = state.devices[id],
            value = type === ON
        if (device)
            return {
                ...state,
                devices: {
                    ...state.devices,
                    [id]: time ? {...device, value, time} : {...device, value}
                }
            }
    }
    return state
}
