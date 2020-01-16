import React from 'react'
import {Container, Header, HeaderContent} from 'semantic-ui-react'

const TopBar = ({player}) => {

    return (
        <Container>
        <Header as="h2" textAlign="center">
            {!!player ? <Header.Content className='alignleft'>Welcome, {player.name}</Header.Content> : null}
          <Header.Content className='aligncenter'>Catch-22: The Game</Header.Content>
          <Header.Content className='alignright'>LOGIN LINK GOES HERE</Header.Content>
        </Header>
      </Container>
    )
}

export default TopBar