const AWS = require('aws-sdk');

// Configure the AWS SDK
AWS.config.update({ region: 'us-east-2' });

const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  
  if (event == undefined) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "event no present" }),
    };
  }
  
  console.info("event\n" + JSON.stringify(event));
  
  let obj = JSON.parse(JSON.stringify(event));
  let userId = obj.path.substring(1);

  const params = {
    TableName: 'ExUserManagementTable', 
    Key: {
      id: userId
    }
  };

  try {
    // Delete the item from DynamoDB
    await dynamodb.delete(params).promise();

    // Return a success response
    const response = {
      statusCode: 200,
      body: JSON.stringify({ message: 'Item deleted successfully' })
    };

    return response;
  } catch (error) {
    // Return an error response if the deletion fails
    const response = {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to delete item' })
    };

    return response;
  }
};