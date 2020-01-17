import React from 'react'
import {Container, Header} from 'semantic-ui-react'
import {Link} from 'react-router-dom'
import logo from '../assets/yossarianlives.jpeg'

const TopBar = ({player}) => {

    return (
        <Container>
        <Header as="h2" className='flex-left-to-right'>
          <div><img src={logo} alt='a marionette' style={{width: '10px', height: '10px'}}/></div>
          <Header.Content>Catch-22: The Game</Header.Content>
          <Header.Content style={{fontSize: 'large'}}>
            {player ? <Link to='/logout'>Log Out</Link> : <Link to='/login'>Log In</Link>}
          </Header.Content>
        </Header>
      </Container>
    )
}

export default TopBar