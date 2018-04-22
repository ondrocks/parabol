// @flow
import React from 'react';
import styled from 'react-emotion';
import type {RetroSidebarDiscussSection_viewer as Viewer} from './__generated__/RetroSidebarDiscussSection_viewer.graphql';
import {createFragmentContainer} from 'react-relay';
import StyledFontAwesome from 'universal/components/StyledFontAwesome';
import ui from 'universal/styles/ui';
import MeetingSidebarLabelBlock from 'universal/components/MeetingSidebarLabelBlock';
import MeetingSubnavItem from 'universal/components/MeetingSubnavItem';
import {LabelHeading} from 'universal/components';

type Props = {|
  gotoStageId: (stageId: string) => void,
  viewer: Viewer
|}

const SidebarPhaseItemChild = styled('div')({
  display: 'flex',
  flexDirection: 'column'
});

const VoteTally = styled('div')({
  lineHeight: ui.navTopicLineHeight,
  marginRight: '0.5rem'
});

const CheckIcon = styled(StyledFontAwesome)(({isUnsyncedFacilitatorStage}) => ({
  color: isUnsyncedFacilitatorStage ? ui.palette.warm : ui.palette.mid
}));

const RetroSidebarDiscussSection = (props: Props) => {
  const {gotoStageId, viewer: {team: {newMeeting}}} = props;
  const {localPhase, localStage, facilitatorStageId} = newMeeting || {};
  if (!localPhase || !localPhase.stages) return null;
  const {stages} = localPhase;
  const inSync = localStage ? localStage.localStageId === facilitatorStageId : true;

  return (
    <SidebarPhaseItemChild>
      <MeetingSidebarLabelBlock>
        <LabelHeading>{'Upvoted Topics'}</LabelHeading>
      </MeetingSidebarLabelBlock>
      {stages.map((stage, idx) => {
        const {reflectionGroup} = stage;
        if (!reflectionGroup) return null;
        const {title, voteCount} = reflectionGroup;
        // the local user is at another stage than the facilitator stage
        const isUnsyncedFacilitatorStage = !inSync && stage.id === facilitatorStageId;
        const navState = {
          isActive: localStage.localStageId === stage.id, // the local user is at this stage
          isComplete: stage.isComplete, // this stage is complete
          isDisabled: false, // TODO: if the user can’t navigate here yet, may not ever be true by design
          isUnsyncedFacilitatorStage
        };
        const voteMeta = (
          <VoteTally>
            <CheckIcon isUnsyncedFacilitatorStage={isUnsyncedFacilitatorStage} name="check" />
            {' x '}
            {voteCount}
          </VoteTally>
        );
        return (
          <MeetingSubnavItem
            key={stage.id}
            label={title}
            metaContent={voteMeta}
            onClick={() => gotoStageId(stage.id)}
            orderLabel={`${idx + 1}.`}
            {...navState}
          />
        );
      })}
    </SidebarPhaseItemChild>
  );
};

export default createFragmentContainer(
  RetroSidebarDiscussSection,
  graphql`
    fragment RetroSidebarDiscussSection_viewer on User {
      team(teamId: $teamId) {
        newMeeting {
          localStage {
            localStageId: id
          }
          ... on RetrospectiveMeeting {
            facilitatorStageId
            # load up the localPhase
            phases {
              ... on DiscussPhase {
                stages {
                  id
                  reflectionGroup {
                    title
                    voteCount
                  }
                }
              }
            }
            localPhase {
              ... on DiscussPhase {
                stages {
                  id
                  isComplete
                  reflectionGroup {
                    title
                    voteCount
                  }
                }
              }
            }
          }
        }
      }
    }
  `
);
