import styled from '@emotion/styled'
import React, {ReactNode} from 'react'
import {DECELERATE} from '../styles/animation'
import {NavSidebar} from '../types/constEnums'

const DURATION = 200

interface StyleProps {
isOpen: boolean
}
const Placeholder = styled('div')<StyleProps>(({isOpen}) => ({
  minWidth: isOpen ? NavSidebar.WIDTH : 0,
  maxWidth: isOpen ? NavSidebar.WIDTH : 0,
  // changing width is expensive, but this is only run on non-mobile devices, so it's not horrible & looks better than alternatives
  transition: `all ${DURATION}ms ${DECELERATE}`,
  // needs to be above the main view area
  zIndex: 200
}))

const Fixed = styled('div')<StyleProps>(({isOpen}) => ({
  position: 'fixed',
  transform: `translateX(${isOpen ? 0 : -NavSidebar.WIDTH}px)`,
  transition: `all ${DURATION}ms ${DECELERATE}`
}))

interface Props {
  children: ReactNode
  isOpen: boolean
}

const StaticSidebar = (props: Props) => {
  const {children, isOpen} = props
  return (
    <Placeholder isOpen={isOpen}>
      <Fixed isOpen={isOpen}>{children}</Fixed>
    </Placeholder>
  )
}

export default StaticSidebar
