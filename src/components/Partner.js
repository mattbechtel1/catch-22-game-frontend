import React from 'react'
import {List} from 'semantic-ui-react'

const Partner = ({character, clickHandler}) => {
    let icon
    switch (character.sublist) {
        case 'airman':
            icon = 'plane'
            break;
        case 'storage':
            switch (character.name) {
                case 'Young Recruit': 
                    icon = 'plane'
                    break;
                case 'Nurse Duckett':
                    icon = 'heart'
                    break;
                case 'Major Major Major Major':
                    icon = 'plane'
                    break;
                case "Nately's Whore":
                    icon = 'warning circle'
                    break;
                default:
                icon = 'user'
            }
        break;
        case 'special':
            switch (character.name) {
                case 'Milo':
                    icon = 'plane'
                    break;
                case 'Doc Daneeka':
                    icon = 'user md'
                    break;
                default:
                    icon = 'user'
            }
        break;
        default:
            icon = 'user'
    }

    return (
        <List.Item as='h4' style={{margin: '0px'}} onClick={clickHandler}>
            <List.Content><List.Icon name={icon} /> {character.name}</List.Content>
        </List.Item>
    )
}

export default Partner