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

export const command = action => `RF ${action.id} ${action.type}`