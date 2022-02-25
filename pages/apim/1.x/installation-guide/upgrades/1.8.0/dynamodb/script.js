let AWS = require('aws-sdk');
AWS.config.loadFromPath('./config.json');
let dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});
let documentClient = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});
let now = Date.now();

let params = {
  TableName: "GraviteeioApimMembership"
};
dynamodb.scan(params, function(err, data) {
  console.log("Update existing memberships to add scope");
  if (err) {
    console.log(err, err.stack);
  }
  else {
    for (let membership of data.Items) {
      let referenceType = membership.referenceType.S;
      let roleScope;
      if (referenceType === "API" || referenceType === "API_GROUP") {
        roleScope = "3:"
      } else if (referenceType === "APPLICATION" || referenceType === "APPLICATION_GROUP") {
        roleScope = "4:"
      }

      let newType = roleScope + membership.type.S;

      console.log("\n    - id[" + membership.userId.S + ":" + membership.referenceId.S + ":" + membership.referenceType.S + "]");
      console.log("        " + membership.type.S + " -> " + newType);

      let params = {
        ExpressionAttributeNames:  { "#T": "type" },
        ExpressionAttributeValues: { ":t": { S: newType } },
        Key:                       { "id": { S: membership.id.S } },
        TableName:                 "GraviteeioApimMembership",
        UpdateExpression:          "SET #T = :t"
      };
      dynamodb.updateItem(params, function(err, data) {
        if (err) {
          console.log(err, err.stack);
        } else {
          console.log(data);
        }
      });
    }
  }
});


params = {
  TableName: "GraviteeioApimUser"
};
dynamodb.scan(params, function(err, data) {
  console.log("\n\nCreate default roles for scope MANAGEMENT and PORTAL");
  if (err) {
    console.log(err, err.stack);
  } else {
    for (let user of data.Items) {
      console.log("\n    - user = " + user.username.S);
      let mgmt_role = "USER";
      let portal_role = "USER";
      if (user.roles) {
        let roles = user.roles.SS;
        if (roles && roles.length > 0) {
          mgmt_role = roles[0];
          portal_role = roles[0];
          console.log("      oldRole = " + mgmt_role);
          if (mgmt_role === "API_CONSUMER") {
            mgmt_role = "USER";
            portal_role = "USER";
          }
        }
      }
      if (user.username.S === "admin") {
        mgmt_role = "ADMIN";
        portal_role = "ADMIN";
      } else if (user.username.S === "api1") {
        mgmt_role = "API_PUBLISHER";
        portal_role = "USER";
      }
      console.log("      mgmt_role = " + mgmt_role);
      console.log("      portal_role = " + portal_role);

        let params = {
          RequestItems: {
            "GraviteeioApimMembership": [
              {
                PutRequest: {
                  Item: {
                    "id": {"S": user.username.S + ":MANAGEMENT:DEFAULT"},
                    "userId": {"S": user.username.S},
                    "referenceId": {"S": "DEFAULT"},
                    "referenceType": {"S": "MANAGEMENT"},
                    "type": {"S": "1:" + mgmt_role},
                    "createdAt": {"N": now.toString()},
                    "updatedAt": {"N": now.toString()}
                  }
                }
              }, {
                PutRequest: {
                  Item: {
                    "id": {"S": user.username.S + ":PORTAL:DEFAULT"},
                    "userId": {"S": user.username.S},
                    "referenceId": {"S": "DEFAULT"},
                    "referenceType": {"S": "PORTAL"},
                    "type": {"S": "2:" + portal_role},
                    "createdAt": {"N": now.toString()},
                    "updatedAt": {"N": now.toString()}
                  }
                }
              }
            ]
          }
        };

      dynamodb.batchWriteItem(params, function (err, data) {
          if (err) {
            console.log("Error", err);
          } else {
            console.log("Success", data);
          }
        });

      params = {
        TableName : 'GraviteeioApimUser',
        Item: {
          username:         user.username.S,
          createdAt:        Number(user.createdAt.N),
          updatedAt:        now
        }
      };
      if (user.lastConnectionAt) {
        params.Item["lastConnectionAt"] = Number(user.lastConnectionAt.N);
      }
      if (user.source) {
        params.Item["source"] = user.source.S;
      }
      if (user.email) {
        params.Item["email"] = user.email.S;
      }
      if (user.password) {
        params.Item["password"] = user.password.S;
      }
      if (user.firstname) {
        params.Item["firstname"] = user.firstname.S;
      }
      if (user.lastname) {
        params.Item["lastname"] = user.lastname.S;
      }
      if (user.picture) {
        params.Item["picture"] = user.picture.S;
      }
      if (user.sourceId) {
        params.Item["sourceId"] = user.sourceId.S;
      }

      documentClient.put(params, function(err, data) {
        if (err)  {
          console.log(err);
        }
        else {
          console.log(data);
        }
      });
    }
  }
});

