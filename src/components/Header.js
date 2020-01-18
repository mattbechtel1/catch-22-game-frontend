import React from 'react'
import {Container, Header} from 'semantic-ui-react'
import {Link} from 'react-router-dom'
import logo from '../assets/yossarianlives.jpeg'

const TopBar = ({player}) => {

    return (
        <Container style={{backgroundColor: '#0000fe'}}>
        <Header as="h2" className='flex-left-to-right'>
          <div><img src={logo} alt='a marionette' style={{width: '50px'}}/></div>
          <Header.Content className='white-text header-center'>CATCH-22: The Game</Header.Content>
          <Header.Content className='header-center' style={{fontSize: 'large'}}>
            {player ? <Link className='header-link' to='/logout'>Log Out</Link> : <Link className='header-link' to='/login'>Log In</Link>}
          </Header.Content>
        </Header>
      </Container>
    )
}

export default TopBar