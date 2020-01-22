import React from 'react'
import {List} from 'semantic-ui-react'

class Partner extends React.Component {
    constructor(props) {
        super(props)
        this.state = {selected: false}
    }
    
    icon = () => {
        const {character} = this.props
        switch (character.sublist) {
            case 'airman':
                return 'plane'
            case 'storage':
                switch (character.name) {
                    case 'Young Recruit': 
                        return 'plane'
                    case 'Nurse Duckett':
                        return 'heart'
                    case 'Major Major Major Major':
                        return 'plane'
                    case "Nately's Whore":
                        return 'warning circle'
                    default:
                        return 'user'
                }
            case 'special':
                switch (character.name) {
                    case 'Milo':
                        return 'food'
                    case 'Doc Daneeka':
                        return 'user md'
                    case 'Colonel Cathcart':
                        return 'plane'
                    default:
                        return 'user'
                }
            default:
                return'user'
        }
    }

    handleHoverEvents = () => {
        this.setState({selected: !this.state.selected})
    }

    color = () => {
        return this.state.selected ? {color: 'teal', margin: '0px', cursor: 'pointer'} : {color: 'black', margin: '0px'}
    }

    render() {
        const {character, clickHandler} = this.props
        return (
            <List.Item as='h4'
                style={this.color()} 
                onClick={clickHandler} 
                onMouseOver={this.handleHoverEvents} 
                onMouseOut={this.handleHoverEvents}
                active={this.state.selected}>
            <List.Content><List.Icon name={this.icon()} /> {character.name}</List.Content>
        </List.Item>
        )
    }
}

export default Partner