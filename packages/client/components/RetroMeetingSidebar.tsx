import {RetroMeetingSidebar_viewer} from '../__generated__/RetroMeetingSidebar_viewer.graphql'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import NewMeetingSidebarPhaseListItem from './NewMeetingSidebarPhaseListItem'
import RetroSidebarPhaseListItemChildren from './RetroSidebarPhaseListItemChildren'
import {useGotoStageId} from '../hooks/useMeeting'
import {MeetingTypeEnum, NewMeetingPhaseTypeEnum} from '../types/graphql'
import getSidebarItemStage from '../utils/getSidebarItemStage'
import findStageById from '../utils/meetings/findStageById'
import isPhaseComplete from '../utils/meetings/isPhaseComplete'
import UNSTARTED_MEETING from '../utils/meetings/unstartedMeeting'
import NewMeetingSidebar from './NewMeetingSidebar'
import MeetingNavList from './MeetingNavList'

interface Props {
  gotoStageId: ReturnType<typeof useGotoStageId>
  handleMenuClick: () => void
  toggleSidebar: () => void
  viewer: RetroMeetingSidebar_viewer
}

const RetroMeetingSidebar = (props: Props) => {
  const {gotoStageId, handleMenuClick, toggleSidebar, viewer} = props
  const {id: viewerId, team} = viewer
  const {meetingSettings, newMeeting} = team!
  const {phaseTypes} = meetingSettings
  const {facilitatorUserId, facilitatorStageId, localPhase, phases} =
    newMeeting || UNSTARTED_MEETING
  const localPhaseType = localPhase ? localPhase.phaseType : ''
  const facilitatorStageRes = findStageById(phases, facilitatorStageId)
  const facilitatorPhaseType = facilitatorStageRes ? facilitatorStageRes.phase.phaseType : ''
  const isViewerFacilitator = facilitatorUserId === viewerId
  const isUnsyncedFacilitatorPhase = facilitatorPhaseType !== localPhaseType
  return (
    <NewMeetingSidebar
      handleMenuClick={handleMenuClick}
      meetingType={MeetingTypeEnum.retrospective}
      toggleSidebar={toggleSidebar}
      viewer={viewer}
    >
      <MeetingNavList>
        {phaseTypes.map((phaseType) => {
          const itemStage = getSidebarItemStage(phaseType, phases, facilitatorStageId)
          const {id: itemStageId = '', isNavigable = false, isNavigableByFacilitator = false} =
            itemStage || {}
          const canNavigate = isViewerFacilitator ? isNavigableByFacilitator : isNavigable
          const handleClick = () => {
            gotoStageId(itemStageId).catch()
            handleMenuClick()
          }
          const discussPhase = phases.find((phase) => {
            return phase.phaseType === NewMeetingPhaseTypeEnum.discuss
          })
          const showDiscussSection = newMeeting && isPhaseComplete(NewMeetingPhaseTypeEnum.vote, phases)
          const phaseCount = phaseType === NewMeetingPhaseTypeEnum.discuss
            && newMeeting
            && showDiscussSection
            ? discussPhase.stages.length
            : undefined
          return (
            <NewMeetingSidebarPhaseListItem
              key={phaseType}
              handleClick={canNavigate ? handleClick : undefined}
              isActive={
                phaseType === NewMeetingPhaseTypeEnum.discuss ? false : localPhaseType === phaseType
              }
              isUnsyncedFacilitatorPhase={isUnsyncedFacilitatorPhase && phaseType === facilitatorPhaseType}
              phaseCount={phaseCount}
              phaseType={phaseType}
            >
              <RetroSidebarPhaseListItemChildren
                gotoStageId={gotoStageId}
                handleMenuClick={handleMenuClick}
                phaseType={phaseType}
                viewer={viewer}
              />
            </NewMeetingSidebarPhaseListItem>
          )
        })}
      </MeetingNavList>
    </NewMeetingSidebar>
  )
}

export default createFragmentContainer(RetroMeetingSidebar, {
  viewer: graphql`
    fragment RetroMeetingSidebar_viewer on User {
      ...RetroSidebarPhaseListItemChildren_viewer
      ...NewMeetingSidebar_viewer
      id
      team(teamId: $teamId) {
        isMeetingSidebarCollapsed
        id
        meetingSettings(meetingType: retrospective) {
          phaseTypes
        }
        newMeeting {
          meetingId: id
          facilitatorUserId
          facilitatorStageId
          localPhase {
            phaseType
          }
          phases {
            phaseType
            stages {
              id
              isComplete
              isNavigable
              isNavigableByFacilitator
            }
          }
        }
      }
    }
  `
})
