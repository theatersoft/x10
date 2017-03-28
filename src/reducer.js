import {ON, on, OFF, off} from './actions'
import {INIT_DEVICES} from './actions'

export default function reducer (state, action) {
    const {type} = action
    switch (type) {
    case INIT_DEVICES:
        const {devices} = action
        return {
            ...state,
            devices
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
