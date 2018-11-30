import {commitMutation} from 'react-relay'
import signinAndUpdateToken from 'universal/components/Auth0ShowLock/signinAndUpdateToken'
import signout from 'universal/containers/Signout/signout'
import getGraphQLError from 'universal/utils/relay/getGraphQLError'

graphql`
  fragment CreateImposterTokenMutation_agendaItem on CreateImposterTokenPayload {
    authToken
    user {
      id
      email
      preferredName
    }
  }
`

const mutation = graphql`
  mutation CreateImposterTokenMutation($userId: ID!) {
    createImposterToken(userId: $userId) {
      error {
        message
      }
      ...CreateImposterTokenMutation_agendaItem @relay(mask: false)
    }
  }
`

const CreateImposterTokenMutation = (atmosphere, userId, {dispatch, history, location}) => {
  const onError = (err) => {
    atmosphere.eventEmitter.emit('addToast', {
      level: 'error',
      title: 'Whoa there!',
      message: err.message
    })
  }

  return commitMutation(atmosphere, {
    mutation,
    variables: {userId},
    onCompleted: async (res, errors) => {
      const serverError = getGraphQLError(res, errors)
      if (serverError) {
        onError(serverError)
        return
      }
      const {createImposterToken} = res
      const {authToken} = createImposterToken

      // Reset application state:
      await signout(atmosphere, dispatch)

      // Assume the identity of the new user:
      await signinAndUpdateToken(atmosphere, history, location, authToken)

      // Navigate to a default location, the application root:
      history.replace('/')
    },
    onError
  })
}

export default CreateImposterTokenMutation
