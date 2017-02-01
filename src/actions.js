//import {Type, Interface, interfaceOfType} from '@theatersoft/device'
export const
    Interface = {
        SWITCH_BINARY: 'SwitchBinary',
        SENSOR_BINARY: 'SensorBinary'
    },
    Type = {
        Switch: 'Switch',
        MotionSensor: 'MotionSensor'
    },
    interfaceOfType = type => ({
        [Type.Switch]: Interface.SWITCH_BINARY,
        [Type.MotionSensor]: Interface.SENSOR_BINARY
    }[type])

export const
    INIT_DEVICES = 'INIT_DEVICES',
    initDevices = devices => ({type: INIT_DEVICES, devices})

export const
    ON = 'ON',
    OFF = 'OFF',
    BRIGHT = 'BRIGHT',
    DIM = 'DIM'
export const
    on = id => ({type: ON, id}),
    off = id => ({type: OFF, id}),
    bright = (id, n) => ({type: BRIGHT, id, n}),
    dim = (id, n) => ({type: DIM, id, n})

export const
    RX = 'RX',
    rx = (type, addr, func) => ({type: RX, rf: type === 'RF', addr, func})

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