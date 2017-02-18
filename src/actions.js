import {Type, Interface, interfaceOfType} from '@theatersoft/device'
import {error} from './log'

export const
    INIT_DEVICES = 'INIT_DEVICES',
    initDevices = devices => ({type: INIT_DEVICES, devices})

import {switchActions} from '@theatersoft/device'
export const {ON, OFF, on, off} = switchActions

export const
    RX = 'RX',
    rx = ({type, addr, func}) => (dispatch, getState) => {
        const
            id = addr,
            device = getState().devices[id]
        if (!device) {
            error(`no device for ${id}`)
            return
        }
        switch (interfaceOfType(device.type)) {
        case Interface.SWITCH_BINARY:
        case Interface.SENSOR_BINARY:
            switch (func) {
            case ON:
            case OFF:
                dispatch({type: func, id})
            }
        }
    }

export const
    API = 'API',
    api = action => (dispatch, getState, {codec}) => {
        const
            {id, type} = action,
            device = getState().devices[id]
        if (!device) throw `no device for ${action}`
        if (interfaceOfType(device.type) === Interface.SWITCH_BINARY) {
            switch (type) {
            case ON:
            case OFF:
                codec.send(type, id)
                dispatch(action)
            }
        }
    }