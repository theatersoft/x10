# @theatersoft/x10
`x10` is a [Theatersoft](https://www.theatersoft.com) [bus](https://github.com/theatersoft/bus) service module that
encapsulates the [X10](https://en.wikipedia.org/wiki/X10_(industry_standard)) home automation protocol to provide 
consistent [device](https://github.com/theatersoft/device) APIs for X10 control and state management.

The [CM15A USB Transceiver](https://www.x10.com/cm15a-module.html) is currently supported by 
encoding and decoding the interface streams from the USB controller using open sourced information about 
the X10 controller protocol.

X10 obviously has been legacy technology for a long time however I personally have X10 outdoor motion sensor floodlights that 
are still working reliably. This `x10` module allows them to be used within the Theatersoft platform.

## Installation
1. Install [Theatersoft](https://www.theatersoft.com). 

2. Add an X10 service configuration object to your site `config.json` to the `services` array of a `hosts` object. E.g:
    ```json
      {
        "enabled": true,
        "module": "@theatersoft/x10",
        "export": "X10",
        "name": "X10",
        "config": {
          "vid": 3015,
          "pid": 1,
          "devices": [
            {
              "name": "Garage",
              "model": "VT38A",
              "id": "A3",
              "type": "Switch"
            },
            {
              "name": "Deck",
              "model": "PR511",
              "id": "A8",
              "type": "Switch"
            },
            {
              "name": "Deck Motion",
              "id": "A9",
              "type": "MotionSensor"
            }
          ]
        }
      }
    ```
    X10 cannot discover devices on its own so you'll need to preconfigure your own devices.
    
3. `npm run config deploy` if you installed Theatersoft using `@theatersoft/home`; otherwise install `@theatersoft/x10`
and restart the server manually.  

## API

Actions control devices through the `X10.dispatch (action :Action)` API. Within the `X10` module, an action would appear 
as `{type: "ON", id: "A3"}`. (Applications normally invoke actions indirectly through the `device` module, so the `id`
would actually be `X10.A3`.)

State is accessed by listening to state signals on the `x10` bus service object. A device state has the form:
```
    "X10.A3" : {
        name: "Garage",
        value: false,
        type: "Switch",
        id: "X10.A3",
        time: 1516156060728
    }
```

## Virtual motion sensor device for VT38A Floodlight
Since this device reports its motion status on the same address that controls it, any motion state would normally only affect the switch state. Instead, add `"model": "VT38A"` to the device config to enable special handling: 
* automatically create an associated virtual `MotionSensor` device e.g. `X10.A3.0`
* discriminate incoming commands between motion reports that update virtual device state and switch commands that update switch state
