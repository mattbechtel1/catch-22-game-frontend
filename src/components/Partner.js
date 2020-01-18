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
                default:
                icon = 'user'
            }
        break;
        case 'special':
            icon = 'plane'
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