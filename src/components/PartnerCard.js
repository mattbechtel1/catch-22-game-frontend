import React from 'react'
import {Card, Image} from 'semantic-ui-react'


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
        if (this.node.contains(e.target)) {
            return;
        }
        this.props.unmount()
    }

    render() {
        const {description, name, occupation, erraticness, image_url} = this.props.character

        return ( 
            <div className='inner-center-tall' ref={node => {this.node = node}}>
                <Card>
                    {image_url ? <Image src={image_url} wrapped ui={false} /> : null}
                    <Card.Content>
                        <Card.Header>{name}</Card.Header>
                        <Card.Meta><span className='date'>{occupation}</span></Card.Meta>
                        <Card.Description>
                            {description}
                        </Card.Description>
                    </Card.Content>
                    <Card.Content extra>
                        Flight Erraticness: {erraticness ? erraticness : 'N/A'}
                    </Card.Content>
                </Card>
            </div>
        )
    }
}

export default PartnerCard