import React from 'react'
import {Card, Image, Icon} from 'semantic-ui-react'


class PartnerCard extends React.Component {
    constructor() {
        super()
        this.handleOffClick = this.handleOffClick.bind(this)
    }

    componentDidMount() {
        document.addEventListener('click', this.handleOffClick, false)
    }

    componentWillUnmount() {
        document.removeEventListener('click', this.handleOffClick, false)
    }

    handleOffClick = (e) => {
        // debugger
        if (this.node.contains(e.target)) {
            return;
        }
        this.props.unmount()
    }

    render() {
        const {description, name, sanityChange, occupation} = this.props.character
        // debugger
        return ( 
            <div className='inner-center-tall' ref={node => {this.node = node}}>
                <Card>
                    <Image src='https://react.semantic-ui.com/images/avatar/large/matthew.png' wrapped ui={false} />
                    <Card.Content>
                        <Card.Header>{name}</Card.Header>
                        <Card.Meta><span className='date'>{occupation}</span></Card.Meta>
                        <Card.Description>
                            {description}
                        </Card.Description>
                    </Card.Content>
                    <Card.Content extra>
                        <a><Icon name='user' />22 Friends</a>
                    </Card.Content>
                </Card>
            </div>
        )
    }
}

export default PartnerCard