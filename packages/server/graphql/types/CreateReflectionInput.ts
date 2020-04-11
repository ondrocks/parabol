import {
  GraphQLFloat,
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLString,
  GraphQLBoolean
} from 'graphql'

const CreateReflectionInput = new GraphQLInputObjectType({
  name: 'CreateReflectionInput',
  fields: () => ({
    content: {
      type: GraphQLString,
      description: 'A stringified draft-js document containing thoughts'
    },
    meetingId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    retroPhaseItemId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The phase item the reflection belongs to'
    },
    sortOrder: {
      type: new GraphQLNonNull(GraphQLFloat)
    },
    isAnonymous: {
      type: new GraphQLNonNull(GraphQLBoolean)
    }
  })
})

export default CreateReflectionInput
