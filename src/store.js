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

export default createStore(
    reducer,
    {devices: []},
    devToolsEnhancer({name: 'X10', realtime: true, port: 6400})
)
