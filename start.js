'use strict'
const
    bus = require('@theatersoft/bus').default,
    service = {
        module: '@theatersoft/x10',
        export: 'X10',
        name: 'X10',
        config: {
            vid: 0x0bc7, pid: 0x0001, devices: [
                {
                    "name": "Studio",
                    "id": "A1"
                },
                {
                    "name": "Front",
                    "id": "A2"
                },
                {
                    "name": "Garage",
                    "id": "A3"
                },
                {
                    "name": "Path",
                    "id": "A4"
                },
                {
                    "name": "Deck",
                    "id": "A5"
                },
                {
                    "name": "Theater",
                    "id": "A6",
                    "dim": "true"
                },
                {
                    "name": "Garage",
                    "id": "A7",
                    "device": "PR511"
                },
                {
                    "name": "Office motion",
                    "id": "A8",
                    "device": "MS14A"
                }
            ]
        }
    }

bus.start().then(() =>
    new (require(service.module)[service.export])().start(service))