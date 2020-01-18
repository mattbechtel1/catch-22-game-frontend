import React from 'react'
import {Card, Image, Icon} from 'semantic-ui-react'


const PartnerCard = ({description, id, name, sanityChange, occupation}) => {
    return ( 
        <Card>
            <Image src='https://react.semantic-ui.comhttps://react.semantic-ui.com/images/avatar/large/matthew.png' wrapped ui={false} />
            <Card.Content>
                <Card.Header>{name}</Card.Header>
                <Card.Meta><span className='date'>{occupation}</span></Card.Meta>
                <Card.Description>
                    Matthew is a musician living in Nashville.
                </Card.Description>
            </Card.Content>
            <Card.Content extra>
                <a><Icon name='user' />22 Friends</a>
            </Card.Content>
        </Card>
    )
}

export default PartnerCard