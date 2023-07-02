import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-2'}); 
var dynamoDBCln = new AWS.DynamoDB.DocumentClient();

export const handler = async (event) => {
//exports.handler = async (event) => {
  try {
    
    if (event == undefined) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "event no present" }),
      };
    }
    
    console.info("event\n" + JSON.stringify(event, null, 2))
    
    // Extract the request body
    const requestBody = JSON.parse(JSON.stringify(event, null, 2));
    
    let response = await dataValidation(requestBody);
    
    if (response.statusCode != 201) {
      return response;
    }
     
    // Save the user data to DynamoDB
    const userId = await saveUserToDynamoDB(requestBody);

    // Return a response
    return {
      statusCode: 201,
      body: JSON.stringify({ user_id: userId }),
    };

  } catch (error) {
    // Return an error response
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

// Data validation
async function dataValidation(requestBody) {
    if (requestBody.firstName == undefined) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "missing the first name" }),
      };
    }
    
    if (requestBody.lastName == undefined) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "missing the last name" }),
      };
    }
    
    if (requestBody.email == undefined) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "missing the email" }),
      };
    }
    
    if (requestBody.password == undefined) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "missing the password" }),
      };
    } 
    
    return {
      statusCode: 201,
      body: JSON.stringify({ rsp: "ok" }),
    };
}

async function saveUserToDynamoDB(userData) {
  // Generate a unique ID for the user
  const id = generateUniqueId();
  
  console.info("id: ", id);
  console.info("userData: ", userData);
  
  // Prepare the item to be saved to DynamoDB
  const params = {
    TableName: 'ExUserManagementTable',
    Item: {
      id: id,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      password: userData.password
    },
  };

  // Save the item to DynamoDB
  await dynamoDBCln.put(params).promise();

  return id;
}

function generateUniqueId() {
  // Generate a unique ID using a library or algorithm of your choice
  // For simplicity, this example uses a random string with a timestamp
  const timestamp = Date.now().toString();
  const randomString = Math.random().toString(36).substring(2, 8);

  return `${timestamp}-${randomString}`;
}
