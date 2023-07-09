const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-2'}); 
var dynamoDBCln = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    
    if (event == undefined) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "event no present" }),
      };
    }

    let obj = JSON.parse(JSON.stringify(event));
    console.info("event(body)\n" + obj.body);
    
    let delimmiter = '\n';
    let index = obj.body.indexOf(delimmiter);
    if (index == -1) {
      index = obj.body.indexOf('\r');
      delimmiter = '\r';
    }

    let lines = [];
    if (index == -1) {
      if (obj.body.length == 0) {
        return {
          statusCode: 500,
          body: JSON.stringify({ error: "line delimiter no present" }),
        };
      }
      
      lines[0] = obj.body;
    }
    else {
      lines = obj.body.split(delimmiter);
    }
    
    console.info("line[0]" + lines[0]);
    //console.info("line length" + lines.length);
    
    let users_id ="{{";
    let count = 0;
    for (let i = 0; i <lines.length; i++) {
      
      if (lines[i].length == 0) {
        continue;
      }
        
      let user = lines[i].split(',');
      if (user.length != 5) {
        console.info("bad user: " + user);
        continue;
      }
        
      console.info("user[" + i + "]" + user[1] + " " + user[2]);
        
      let userId = await saveUserToDynamoDB(user);
      console.info("user[" + i + "]" + user[1] + " " + user[2] + " id: " + userId );
      
      users_id += "user: " + user[1] + ", id: " + userId + "}";
      
      if (i < lines.length - 1) {
        users_id += ", {";
      }
      
      count += 1;
    }
    
    if (count == 0) {
          return {
          statusCode: 500,
          body: JSON.stringify({ error: "parse user parameters failed" }),
        };
    }
    
    users_id += "}";
    
    let msg = JSON.stringify(users_id);
    
    const response = {
        statusCode: 201,
        body: msg,
    };
    return response;
};

async function saveUserToDynamoDB(userData) {
  // Generate a unique ID for the user
  //const id = generateUniqueId();
  
  //console.info("id: ", id);
  //console.info("userData: ", userData);
  
  // Prepare the item to be saved to DynamoDB
  const params = {
    TableName: 'ExUserManagementTable',
    Item: {
      id: userData[0],
      firstName: userData[1],
      lastName: userData[2],
      email: userData[3],
      password: userData[4]
    },
  };

  // Save the item to DynamoDB
  await dynamoDBCln.put(params).promise();

  return userData[0];
}

function generateUniqueId() {
  // Generate a unique ID using a library or algorithm of your choice
  // For simplicity, this example uses a random string with a timestamp
  const timestamp = Date.now().toString();
  const randomString = Math.random().toString(36).substring(2, 8);

  return `${timestamp}-${randomString}`;
}

