import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';
const AWSXRay = require('aws-xray-sdk');
const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccessLayer')

// TODO: Implement the dataLayer logic
export class TodosAccess {

    // Get and set variable from environments process
    constructor(
      private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
      private readonly todosTable = process.env.TODOS_TABLE,
      private readonly todosByUserIndex = process.env.TODOS_BY_USER_INDEX
    ) {}
  
    // Function check exist record todo in table todo on aws
    async todoItemExists(todoId: string,userId: string): Promise<boolean> {
      const item = await this.getTodoItem(todoId,userId)
      return !!item
    }
    
    // Write log and get all record from table todo  by userId
    async getTodoItems(userId: string): Promise<TodoItem[]> {
      logger.info(`Start getting all todos for user ${userId} from ${this.todosTable} table`)
  
      const result = await this.docClient.query({
        TableName: this.todosTable,
        IndexName: this.todosByUserIndex,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      }).promise()
      const items = result.Items
      logger.info(`User ${userId} has ${items.length} todos in ${this.todosTable} table`)
  
      return items as TodoItem[]
    }
  
    //Get record todo by todoid from table
    async getTodoItem(todoId: string,userId : string): Promise<TodoItem> {
      logger.info(`Start getting todo ${todoId} from ${this.todosTable} table`)
  
      const result = await this.docClient.get({
        TableName: this.todosTable,
        Key: {
             userId,
             todoId
        }
      }).promise()

      logger.info('Result ' + result);
      const item = result.Item;

      logger.info(`End getting todo ${todoId} from ${this.todosTable} table`)
      return item as TodoItem
    }
  
    //Create new record todo into table todoTable 
    async createTodoItem(todoItem: TodoItem) {
      logger.info(`Putting todo ${todoItem.todoId} into table ${this.todosTable}`)
      await this.docClient.put({
        TableName: this.todosTable,
        Item: todoItem,
      }).promise()
    }
  
    //Update record todo by todo id and data into todoTable
    async updateTodoItem(todoId: string,userId : string, todoUpdate: TodoUpdate) {
      logger.info(`Start updating todo item ${todoId} in table ${this.todosTable}`)
  
      await this.docClient.update({
        TableName: this.todosTable,
        Key: {
          userId,
          todoId
        },
        UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
        ExpressionAttributeNames: {
          "#name": "name"
        },
        ExpressionAttributeValues: {
          ":name": todoUpdate.name,
          ":dueDate": todoUpdate.dueDate,
          ":done": todoUpdate.done
        }
      }).promise()   
      logger.info(`Updated success todo item ${todoId} in table ${this.todosTable}`)
    }
  
    //Delete record in todoTable by todoId
    async deleteTodoItem(todoId: string,userId : string) {
      logger.info(`Deleting todo item ${todoId} from ${this.todosTable} table`)
      await this.docClient.delete({
        TableName: this.todosTable,
        Key: {
          userId,
          todoId
        }
      }).promise()    
    }
  
    //Update Image by todoId and url file
    async updateAttachmentUrl(todoId: string,userId : string, attachmentUrl: string) {
      logger.info(`Updating attachment URL for todo ${todoId} in table ${this.todosTable}`)
  
      await this.docClient.update({
        TableName: this.todosTable,
        Key: {
          userId,
          todoId
        },
        UpdateExpression: 'set attachmentUrl = :attachmentUrl',
        ExpressionAttributeValues: {
          ':attachmentUrl': attachmentUrl
        }
      }).promise()
    }
  
  }
  