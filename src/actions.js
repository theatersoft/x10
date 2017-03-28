import {Type, Interface, interfaceOfType} from '@theatersoft/device'
import {log, error} from './log'

const
    reorder = arr => arr.map(({name, value, type, id}) => ({name, value, type, id})),
    index = arr => arr.reduce((o, e) => (o[e.id] = e, o), {})

export const
    INIT_DEVICES = 'INIT_DEVICES',
    initDevices = devices => ({type: INIT_DEVICES, devices: index(reorder(devices))})

import {switchActions} from '@theatersoft/device'
export const {ON, OFF, on, off} = switchActions

const
    delay = 60000,
    throttle = (t1 = 0, t2 = 0) => Math.abs(t1 - t2) < delay

export const
    rx = ({type: rf, addr, func: type}) => (dispatch, getState) => {
        const
            id = addr,
            device = getState().devices[id]
        let action
        if (!device) return error(`no device for ${id}`)
        switch (type) {
        case ON:
        case OFF:
            switch (interfaceOfType(device.type)) {
            case Interface.SENSOR_BINARY:
                const
                    value = type === ON,
                    time = Date.now()
                if (value !== device.value || !throttle(time, device.time))
                    action = {type, id, time}
                break
            case Interface.SWITCH_BINARY:
                action = {type, id}
                break
            }
        }
        if (action) {
            log('RX', rf, addr, type)
            dispatch(action)
        }
    }

export const
    api = action => (dispatch, getState, {codec}) => {
        const
            {id, type} = action,
            device = getState().devices[id]
        if (!device) return error(`no device for ${action}`)
        if (interfaceOfType(device.type) === Interface.SWITCH_BINARY) {
            switch (type) {
            case ON:
            case OFF:
                codec.send(type, id)
                dispatch(action)
            }
        }
    }