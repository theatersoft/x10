import {h, Component} from 'preact'
import {ListItem, Switch, Subheader} from '@theatersoft/components'
import {proxy} from '@theatersoft/bus'
import {serviceId} from '@theatersoft/device'
import {connect} from './redux'

const Settings = proxy('Settings')
export const settingsAction = state => () => Settings.setState(state)

const
    mapState = p => p,
    mapDispatch = dispatch => ({
        dispatch: {
            settings: state => dispatch(settingsAction(state))
        }
    })

export const ServiceSettings = (ComposedComponent, props) => connect(mapState, mapDispatch)(class ServiceSettings extends Component {
    onClick = e => {
        const
            [service, id] = serviceId(e.currentTarget.dataset.id),
            value = this.props[service][id]
        this.props.dispatch[service]({[id]: !value})
    }

    onChange = (value, e) => this.onClick(e)

    render ({settings}) {
        const
            item = (label, value, id) =>
                <ListItem label={label}>
                    <Switch checked={value} data-id={id} onChange={this.onChange}/>
                </ListItem>
        return (
            <ComposedComponent {...props}>
            </ComposedComponent>
        )
    }
})

export const DeviceSettings = (ComposedComponent, props) => connect(mapState, mapDispatch)(class DeviceSettings extends Component {
    render ({id, devices, settings}) {
        if (!id) return null
        const
            [service, _id] = serviceId(id),
            device = devices[id],
            {name, value, type} = device
        return (
            <ComposedComponent {...props}>
                <Subheader label="Service"/>
                <ListItem label={service}/>
                <Subheader label="Type"/>
                <ListItem label={type}/>
                <Subheader label="ID"/>
                <ListItem label={_id}/>
                <Subheader label="Name"/>
                <ListItem label={name}/>
                <Subheader label="Value"/>
                <ListItem label={String(value)}/>
            </ComposedComponent>
        )
    }
})
