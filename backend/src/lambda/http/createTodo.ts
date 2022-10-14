import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import 'source-map-support/register'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../utils';
import { createTodo } from '../../BLL/todos'
import { createLogger } from '../../utils/logger'

const logger = createLogger('CreateTodo-Http')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Start process CreateTodo Event', { event })
  const newTodo: CreateTodoRequest = JSON.parse(event.body)
  const userId = getUserId(event)
  const newItem = await createTodo(userId, newTodo)
  logger.info('End process CreateTodo Event', { event })
  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      item: newItem
    })
  }
}

