import React from 'react'
import {Button} from 'semantic-ui-react'

const OptionList = ({options}) => {
    let colorDetermine = (num) => {
        if (num % 2) {
            return 'blue'
        } else {
            return 'red'
        }
    }

    return <div>
        <Button.Group vertical>
            {options.map((option, index) => <Button inverted key={option.text} color={colorDetermine(index)} onClick={option.callResult}>{option.text}</Button>)}
        </Button.Group>
    </div>
}

export default OptionList