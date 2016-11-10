import usb from 'usb'
import {EventEmitter} from '@theatersoft/bus'

//usb.setDebugLevel(4)
let x10, rx, tx, rxAddress   // address first packet, function next packet

const
    emitter = new EventEmitter(),
    decodePL = data => {
        if (data[1] === 0x02 && data.length == 4) {
            if (data[2] === 0x00) {  // Address
                rxAddress = data[3]
            } else if (rxAddress !== undefined && data[2] === 0x01) { // Function
                let r = {type: 'PL', addr: addrToString(decHouse(rxAddress), decUnit(rxAddress)), func: funcToString(decFunc(data[3]))}
                rxAddress = undefined
                return r
            }
        }
    },
    decodeRF = data => {
        let chk = data[2] ^ data[3]
        if (chk === 0xff) {
            let chk = data[4] ^ data[5]
            if (chk !== 0xff && chk !== 0xfb) {
                console.log('RX RF bad checksum', data)
                return
            }
            // TODO dup filter
            let house = data[2] >> 4, unit, func
            if (data[4] === 0x88) {
                func = 3 // OFF or BRIGHT???
                unit = 0
            }
            else if (data[4] === 0x98) {
                func = 2 // ON or DIM???
                unit = 0
            } else {
                func = (data[4] & 1 << 5) >> 5
                unit = (data[2] & 1 << 2) >> 2
                unit |= (data[4] & 1 << 6) >> 4
                unit |= (data[4] & 1 << 3) >> 2
                unit |= (data[4] & 1 << 4) >> 4
            }
            return {type: 'RF', addr: addrToString(house, unit), func: funcToString(func)}
        }
    },
    init = ({vid = 0x0bc7, pid = 0x0001} = {}) => {
        console.log('x10 init', vid, pid)
        x10 = usb.findByIds(vid, pid)
        x10.open()
        let intf = x10.interfaces[0]
        intf.claim()
        rx = intf.endpoint(0x81) // from controller
        tx = intf.endpoint(0x02) // to controller

        rx.on('data', data => {
            console.log('RX', data)
            let r
            switch (data[0]) {
                case 0x55: // ACK
                    console.log('RX ACK')
                    return
                case 0xa5: // set clock
                    send(encodeSetClock())
                    return
                case 0x5a: // PL
                    r = decodePL(data)
                    break
                case 0x5d: // RF
                    r = decodeRF(data)
                    break
            }
            if (r) {
                console.log('RX', r.type, r.addr, r.func)
                emitter.emit('rx', r)
            }
        })
        rx.on('end', () => console.log('RX END'))
        rx.on('error', err => console.log('RX ERROR', err))
        rx.startPoll()
    },
    send = data => {
        console.log('TX', data)
        tx.transfer(data, err => console.log('TX DONE', err || ''))
    }

var
    ADDR = [6, 14, 2, 10, 1, 9, 5, 13, 7, 15, 3, 11, 0, 8, 4, 12],
    INV_ADDR = [12, 4, 2, 10, 14, 6, 0, 8, 13, 5, 3, 11, 15, 7, 1, 9],
    ADDR_RF = [6, 7, 4, 5, 8, 9, 10, 11, 14, 15, 12, 13, 0, 1, 2, 3],
    INV_ADDR_RF = [12, 13, 14, 15, 2, 3, 0, 1,  4, 5, 6, 7, 10, 11, 8, 9 ],
    FUNC = {AOFF: 0, ALON: 1, ON: 2, OFF: 3, DIM: 4, BRIGHT: 5, ALOFF: 6, EXT: 7, HAILREQ: 8, HAILACK: 9, PDIM1: 0xa, PDIM2: 0xb},
    CMD = {
        STATUS: 0x8b,
        SETCLOCK: 0x9b,
        CMDAB: 0xab,
        WRITE: 0xbb,
        CMDCB: 0xcb,
        READ: 0xdb,
        SENDRF: 0xeb,
        MACRO: 0xfb
    },
    encAddr = (house, unit) => ADDR[house] << 4 | ADDR[unit],
    encFunc = (house, func) => ADDR[house] << 4 | func,
    decHouse = addr => ADDR.indexOf(addr >> 4),
    decUnit = addr => ADDR.indexOf(addr & 0xf),
    decFunc = func => func & 0xf,
    encodePL = (house, func) => new Buffer([0x06, encFunc(house, func)]),
    encodePLUnit = (house, unit, func) => new Buffer([0x04, encAddr(house, unit), 0x06, encFunc(house, func)]),
    encodeCmd = cmd => new Buffer([cmd]),
    encodeSetClock = () => {
        var now = new Date(), yday = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000)
        return new Buffer([
            CMD.SETCLOCK,
            now.getSeconds(), now.getMinutes() + 60 * (now.getHours() & 1), now.getHours() >> 1,
            yday, (yday & 0x100) >> 1 | 1 << now.getDay(),
            0x60, // house 0:timer purge, 1:monitor clear, 3:battery clear
            0
        ])
    },
    encodeRFUnit = (house, unit, func) => {
        var buf = [CMD.SENDRF, 0x20, ADDR[house] << 4 | (unit & 8) >> 1, 0, 0, 0]
        switch (func) {
            case FUNC.OFF:
                buf[4] = 0x20
            case FUNC.ON:
                buf[4] |= (unit & 4) << 4 | (unit & 2) << 2 | (unit & 1) << 4
                break;
            default:
                throw ('Invalid func')
        }
        buf[3] = ~buf[2]
        buf[5] = ~buf[4]
        return new Buffer(buf)
    },
    addrToString = (house, unit) => String.fromCharCode(house + 65) + String.fromCharCode(unit + 49),
    funcToString = func => getKeyByValue(FUNC, func) || '???',
    getKeyByValue = (obj, value) => {for (let key of Object.keys(obj)) if (obj[key] === value) return key}

//    init = () => {
//        let bin = [
//            [0x80,0x05,0x1b,0x14,0x28,0x20,0x24,0x29],
//            [0x83,0x03],
//            [0x84,0x37,0x02,0x60,0x00,0x00,0x00,0x00],
//            [0x80,0x01,0x00,0x14,0x20,0x24,0x28,0x29],
//            [0x83,0x02,0x0f],
//            [0x83,0x37,0x02,0x60,0x00,0x00,0x00,0x00],
//            [0x20,0x34,0xcb,0x58,0xa7],
//            [0x80,0x05,0x01,0x14,0x20,0x24,0x28,0x29]
//        ]
//        for (let c of bin) {
//            tx.transfer(new Buffer(c), err => {console.log('TX DONE', err || '')})
//        }
//    }
//
//init()

var house = 0, unit = 3, index = 0, data = [
    //encodeSetClock(house),
//    encodePL(house, FUNC.ALON),
//    encodePL(house, FUNC.AOFF),
//    new Buffer([CMD.READ, 0x1f, 0xf0])
//    encodeCmd(CMD.STATUS),
//    new Buffer([CMD.CMDAB, 0xde, 0xaf]),
//    encodeCmd(CMD.STATUS),
//    new Buffer([CMD.CMDAB, 0x00, 0x00]),
//    encodeCmd(CMD.STATUS),
    encodePLUnit(house, unit, FUNC.OFF),
    encodePLUnit(house, unit, FUNC.ON),
    encodeRFUnit(house, unit, FUNC.OFF),
    encodeRFUnit(house, unit, FUNC.ON)
]

if (process.env.mode === 'TEST') {
    console.log('TEST mode')
    init()
    require('keypress')(process.stdin)
    //process.stdin.setRawMode(true)
    process.stdin.on('keypress', function (ch, key) {
        if (key && key.ctrl && key.name == 'c') process.exit()
        console.log('TX', data[index])
        tx.transfer(data[index], err => console.log('TX DONE', err || ''))
        index = (index + 1) % data.length
    })
} else console.log('PROD mode')

emitter.init = init
emitter.sendCommand = cmd => {
    const [, type, house, unit, func] = /^(PL|RF)\s([A-P])([1-8])\s([A-Z]+)$/.exec(cmd)
    console.log('sendCommand', {type, house, unit, func})

    //const data = type === 'PL' ? encodePLUnit()
}

export default emitter
