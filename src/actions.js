import {Type, Interface, interfaceOfType} from '@theatersoft/device'
import {log, error} from './log'

const
    reorder = a => a.map(({name, value, type, id}) => ({name, value, type, id})),
    index = a => a.reduce((o, e) => (o[e.id] = e, o), {}),
    virtualVT38A = (e, a) => e.model === 'VT38A' && a.push({
        name: `${e.name} Motion`,
        type: Type.MotionSensor,
        id: `${e.id}.0`
    }),
    virtualize = devices => devices.concat(devices.reduce((a, e) => (virtualVT38A(e, a), a), []))

export const
    INIT_DEVICES = 'INIT_DEVICES',
    initDevices = devices => ({type: INIT_DEVICES, devices: index(reorder(virtualize(devices)))})

import {switchActions} from '@theatersoft/device'
export const {ON, OFF, on, off} = switchActions

const
    throttle = (t1 = 0, t2 = 0, delay = 60000) => Math.abs(t1 - t2) < delay

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
            const
                value = type === ON,
                time = Date.now()
            switch (interfaceOfType(device.type)) {
            case Interface.SENSOR_BINARY:
                if (value !== device.value || !throttle(time, device.time)) {
                    value && setTimeout(() => dispatch({type: OFF, id, time: Date.now()}), 65000) // in case rx off is lost or throttled
                    action = {type, id, time}
                }
                break
            case Interface.SWITCH_BINARY:
                const
                    virtual = getState().devices[`${id}.0`],
                    virtualAction = virtual && !throttle(time, device.time, 4000) && {type, id: virtual.id, time},
                    virtualOff = () => dispatch({type: OFF, id: virtual.id, time: Date.now()})
                virtualAction && value && setTimeout(virtualOff, 65000) // in case rx off is lost or throttled
                action = virtualAction || {type, id}
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
                return codec.send(type, id)
                    .then(() => {
                        const virtual = getState().devices[`${id}.0`]
                        dispatch({...action, ...virtual && {time: Date.now()}})
                    })
            }
        }
    }