import {TimelineEventCompletedActionMeeting_timelineEvent} from '../__generated__/TimelineEventCompletedActionMeeting_timelineEvent.graphql'
import React, {Component} from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {RouteComponentProps} from 'react-router'
import StyledLink from './StyledLink'
import plural from '../utils/plural'
import relativeDate from '../utils/date/relativeDate'
import TimelineEventBody from './TimelineEventBody'
import TimelineEventCard from './TimelineEventCard'
import TimelineEventTitle from './TImelineEventTitle'
import styled from '@emotion/styled'

interface Props extends RouteComponentProps<{}> {
  timelineEvent: TimelineEventCompletedActionMeeting_timelineEvent
}

const Link = styled(StyledLink)({
  fontWeight: 600
})

const CountItem = styled('span')({
  fontWeight: 600
})

class TimelineEventCompletedActionMeeting extends Component<Props> {
  render() {
    const {timelineEvent} = this.props
    const {meeting, team} = timelineEvent
    const {id: meetingId, name: meetingName, createdAt, endedAt, taskCount} = meeting
    const {name: teamName} = team
    const meetingDuration = relativeDate(createdAt, {
      now: endedAt,
      max: 2,
      suffix: false,
      smallDiff: 'less than a minute'
    })
    return (
      <TimelineEventCard
        iconName='change_history'
        timelineEvent={timelineEvent}
        title={
          <TimelineEventTitle>{`${meetingName} with ${teamName} Complete`}</TimelineEventTitle>
        }
      >
        <TimelineEventBody>
          {`It lasted ${meetingDuration} and generated `}
          <CountItem>{`${taskCount} ${plural(taskCount, 'task')}`}</CountItem>
          {'.'}
          <br />
          <Link to={`/new-summary/${meetingId}`}>See the full summary</Link>
        </TimelineEventBody>
      </TimelineEventCard>
    )
  }
}

export default createFragmentContainer(TimelineEventCompletedActionMeeting, {
  timelineEvent: graphql`
    fragment TimelineEventCompletedActionMeeting_timelineEvent on TimelineEventCompletedActionMeeting {
      ...TimelineEventCard_timelineEvent
      id
      meeting {
        id
        createdAt
        endedAt
        name
        taskCount
      }
      team {
        name
      }
    }
  `
})
