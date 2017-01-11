import bus, {EventEmitter} from '@theatersoft/bus'
import {combineReducers, createStore} from 'redux'
import devToolsEnhancer from 'remote-redux-devtools'
import {ON, on, OFF, off} from './actions'
import {INIT_DEVICES} from './actions'

function reducer (state, action) {
    switch (action.type) {
    case INIT_DEVICES:
        return {...state, devices: action.devices}
    case ON:
    case OFF:
        if (action.type === ON !== state.values[action.id])
            return {
                ...state,
                values: {...state.values, [action.id]: action.type === ON}
            }
    }
    return state
}

export default createStore(
    reducer,
    {devices: [], values: {}},
    devToolsEnhancer({name: 'X10', realtime: true, port: 6400})
)
