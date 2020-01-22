import React from 'react'
import {Header} from 'semantic-ui-react'

const Message = ({text}) => {
    return <Header as='h1' textAlign='center'><span className='white-text'>{text}</span></Header>
}

export default Message