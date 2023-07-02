const AWS = require('aws-sdk');

const docClient = new AWS.DynamoDB.DocumentClient({ region: 'us-east-2' });

//export const handler = async (event, context, callback) => {
exports.handler = async (event, context) => {
  
  if (event == undefined) {
    return  {
      statusCode: 400,
      body: JSON.stringify({ error: "event no present" }),
    };
  }
  
  console.info("event\n" + JSON.stringify(event));
  //console.info("context\n" + JSON.stringify(context));
  
    /*
    {
      "resource": "/users/{userId}",
      "path": "/123",
      "httpMethod": "GET",
      ...
    }
    */
  
    try {
      let obj = JSON.parse(JSON.stringify(event));
      
      if (obj.path == undefined) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'path missing' })
        };
      }
      
      if (obj.path.indexOf('/') == -1) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'user ID missing' })
        };
      }
      
      // Get UserId
      let userId = obj.path.substring(1);
  
      const params = {
        TableName: 'ExUserManagementTable',
        Key: {
          id: userId
        }
      };
  
      const result = await docClient.get(params).promise();
  
      if (result.Item) {
        return {
          statusCode: 200,
          body: JSON.stringify(result.Item)
        };
      } else {
        return {
          statusCode: 404,
          body: JSON.stringify({ error: 'User not found' })
        };
      }
  } catch (error) {
    console.error('Error retrieving user data:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' })
    };
  }
};