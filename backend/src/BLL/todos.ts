import { TodosAccess } from '../DLL/todosAcess'
import { AttachmentUtils } from '../DLL/attachmentUtils'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'

// TODO: Implement businessLogic
const logger = createLogger('TodosBusinessLayer')

const todosAccess = new TodosAccess()
const todosStorage = new AttachmentUtils()

export async function getTodos(userId: string): Promise<TodoItem[]> {
  logger.info(`Retrieving all todos for user ${userId}`, { userId })

  return await todosAccess.getTodoItems(userId)
}

export async function createTodo(userId: string, createTodoRequest: CreateTodoRequest): Promise<TodoItem> {
  const todoId = uuid.v4()

  const newItem: TodoItem = {
    userId,
    todoId,
    createdAt: new Date().toISOString(),
    done: false,
    attachmentUrl: null,
    ...createTodoRequest
  }

  logger.info(`Creating todo ${todoId} for user ${userId}`, { userId, todoId, todoItem: newItem })

  await todosAccess.createTodoItem(newItem)

  return newItem
}

export async function updateTodo(userId: string, todoId: string, updateTodoRequest: UpdateTodoRequest) {
  logger.info(`Updating todo ${todoId} for user ${userId}`, { userId, todoId, todoUpdate: updateTodoRequest })

  const item = await todosAccess.getTodoItem(todoId,userId)

  if (!item)
    throw new Error('Item not found')  // FIXME: 404?

  if (item.userId !== userId) {
    logger.error(`User ${userId} does not have permission to update todo ${todoId}`)
    throw new Error('User is not authorized to update item')  // FIXME: 403?
  }

  todosAccess.updateTodoItem(todoId,userId,updateTodoRequest as TodoUpdate)
}

export async function deleteTodo(userId: string, todoId: string) {
  logger.info(`Deleting todo ${todoId} for user ${userId}`, { userId, todoId })

  const item = await todosAccess.getTodoItem(todoId,userId)

  if (!item)
    throw new Error('Item not found')  // FIXME: 404?

  if (item.userId !== userId) {
    logger.error(`User ${userId} does not have permission to delete todo ${todoId}`)
    throw new Error('User is not authorized to delete item')  // FIXME: 403?
  }

  todosAccess.deleteTodoItem(todoId,userId)
}

export async function updateAttachmentUrl(userId: string, todoId: string, attachmentId: string) {
  logger.info(`Start generate attachment URL for attachment ${attachmentId}`)

  const attachmentUrl = await todosStorage.getAttachmentUrl(attachmentId)
  logger.info(`Starting update todo ${todoId} with attachment URL ${attachmentUrl}`, { userId, todoId })

  const item = await todosAccess.getTodoItem(todoId,userId)
  logger.info('Getting todo item success');
  if (!item)
    throw new Error('Item not found')  // FIXME: 404?

  if (item.userId !== userId) {
    logger.error(`User ${userId} does not have permission to update todo ${todoId}`)
    throw new Error('User need authorized to update item')  // FIXME: 403?
  }

  await todosAccess.updateAttachmentUrl(todoId,userId, attachmentUrl)
}

export async function generateUploadUrl(attachmentId: string): Promise<string> {
  logger.info(`Starting generate upload URL for attachment ${attachmentId}`)

  const uploadUrl = await todosStorage.getUploadUrl(attachmentId)
  logger.info ('Url upload: ' + uploadUrl)
  return uploadUrl
}