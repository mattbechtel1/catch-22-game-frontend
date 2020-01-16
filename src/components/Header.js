import React from 'react'
import {Container, Header} from 'semantic-ui-react'
import {Link} from 'react-router-dom'

const TopBar = ({player}) => {

    return (
        <Container>
        <Header as="h2">
          <Header.Content className='aligncenter'>Catch-22: The Game</Header.Content>
          <Header.Content style={{fontSize: 'large'}} className='alignright'>
            {player ? <Link to='/logout'>Log Out</Link> : <Link to='/login'>Log In</Link>}
          </Header.Content>
        </Header>
      </Container>
    )
}

export default TopBar