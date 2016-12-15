export const ON = 'ON'
export const OFF = 'OFF'
export const BRIGHTEN = 'BRI'
export const DIM = 'DIM'

export const on = id => {type: ON, id}
export const off = id => {type: OFF, id}
export const brighten = (id, n) => {type: BRIGHTEN, id, n}
export const dim = (id, n) => {type: DIM, id, n}
