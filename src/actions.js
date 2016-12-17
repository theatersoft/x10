export const ON = 'ON'
export const OFF = 'OFF'
export const BRIGHT = 'BRIGHT'
export const DIM = 'DIM'

export const on = id => ({type: ON, id})
export const off = id => ({type: OFF, id})
export const bright = (id, n) => ({type: BRIGHT, id, n})
export const dim = (id, n) => ({type: DIM, id, n})

export const command = action => `RF ${action.id} ${action.type}`