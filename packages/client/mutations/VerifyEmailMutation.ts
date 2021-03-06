import {VerifyEmailMutation as TSignUpWithPasswordMutation} from '../__generated__/VerifyEmailMutation.graphql'
import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {HistoryLocalHandler, StandardMutation} from '../types/relayMutations'
import handleAuthenticationRedirect from './handlers/handleAuthenticationRedirect'

const mutation = graphql`
  mutation VerifyEmailMutation($verificationToken: ID!, $invitationToken: ID) {
    verifyEmail(verificationToken: $verificationToken) {
      error {
        message
      }
      authToken
      user {
        tms
        ...UserAnalyticsFrag @relay(mask: false)
      }
    }
    acceptTeamInvitation(invitationToken: $invitationToken) {
      ...AcceptTeamInvitationMutationReply @relay(mask: false)
    }
  }
`
const VerifyEmailMutation: StandardMutation<TSignUpWithPasswordMutation, HistoryLocalHandler> = (
  atmosphere,
  variables,
  {onError, onCompleted, history}
) => {
  return commitMutation<TSignUpWithPasswordMutation>(atmosphere, {
    mutation,
    variables,
    onError,
    onCompleted: (res, errors) => {
      const {acceptTeamInvitation, verifyEmail} = res
      const authToken = acceptTeamInvitation.authToken || verifyEmail.authToken
      onCompleted({verifyEmail}, errors)
      if (authToken) {
        atmosphere.setAuthToken(authToken)
        handleAuthenticationRedirect(acceptTeamInvitation, {atmosphere, history})
      }
    }
  })
}

export default VerifyEmailMutation
