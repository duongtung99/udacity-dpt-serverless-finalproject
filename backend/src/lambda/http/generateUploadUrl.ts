import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as uuid from 'uuid'
import { generateUploadUrl, updateAttachmentUrl } from '../../BLL/todos'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('GenerateUploadUrl')

// TODO: Generate upload url image and return attachment Url
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Start process GenerateUploadUrl event', { event })

  const userId = getUserId(event)
  const todoId = event.pathParameters.todoId
  const attachmentId = uuid.v4()
  const uploadUrl = await generateUploadUrl(attachmentId)
  await updateAttachmentUrl(userId, todoId, attachmentId)
  logger.info('End process GenerateUploadUrl event', { event })
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      uploadUrl
    })
  }
}
