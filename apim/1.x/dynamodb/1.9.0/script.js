let AWS = require('aws-sdk');
AWS.config.loadFromPath('./config.json');
let dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});
let documentClient = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});
let now = Date.now();


function moveGroupToGroups(tableName) {
  console.log("[ " + tableName + " ] move group to groups.");
  let params = { TableName: tableName };
  dynamodb.scan(params, function(err, data) {
    if (err) {
      console.log(err, err.stack);
    }
    else {
      for (let item of data.Items) {
        if (item.group && !item.groups) {
          console.log("\n    - id: " + item.id.S);
          console.log("      name: " + item.name.S);
          console.log("      group: " + item.group.S);
          let newGroups = [item.group.S];
          console.log("      groups: " + newGroups);

          let params = {
            ExpressionAttributeNames: {"#G": "groups"},
            ExpressionAttributeValues: {":grp": {SS: newGroups}},
            Key: {"id": {S: item.id.S}},
            TableName: tableName,
            UpdateExpression: "SET #G = :grp"
          };
          dynamodb.updateItem(params, function (err, data) {
            if (err) {
              console.log(err, err.stack);
            } else {
              console.log(data);
            }
          });
          console.log("      remove old groupIndex ...");
          params = {
            TableName: tableName,
            GlobalSecondaryIndexUpdates: [{
              Delete: { IndexName: 'ApiGroup' }
          }]};
          dynamodb.updateTable(params, function (err, data) {
            if (err) {
              console.log(err, err.stack);
              console.log("    ERROR !");
            } else {
              console.log(data);
              console.log("    DONE !");
            }
          });
          console.log("      Done!");
        } else {
          console.log("      Already migrated!")
        }
      }
    }
  });
}
console.log("\n\nMove group -> groups for APIs");
moveGroupToGroups("GraviteeioApimApi");
console.log("\n\nMove group -> groups for APIs");
moveGroupToGroups("GraviteeioApimApplication");

console.log("\n\nConvert type to roles in Membership collection");
let params = {
  TableName: "GraviteeioApimMembership"
};
dynamodb.scan(params, function(err, data) {
  if (err) {
    console.log(err, err.stack);
  }
  else {
    for (let membership of data.Items) {
      if (membership.type) {
        let membershipId = membership.id.S;
        let membershipType = membership.type.S;
        let membershipReferenceType = membership.referenceType.S;
        console.log(' - membership: ' + membershipId);
        console.log('   referenceType: ' + membershipReferenceType);
        console.log('   type: ' + membershipType);
        let roles = [membershipType];
        console.log('   roles: ' + roles);
        if (membershipReferenceType === "API_GROUP" || membershipReferenceType === "APPLICATION_GROUP") {
          let newId = membership.userId.S + ":GROUP:" + membership.referenceId.S;
          console.log("    create a new Item: " + newId);
          let params = {
            RequestItems: {
              "GraviteeioApimMembership": [
                {
                  PutRequest: {
                    Item: {
                      "id": {S: newId},
                      "userId": {S: membership.userId.S},
                      "referenceId": {S: membership.referenceId.S},
                      "referenceType": {S: "GROUP"},
                      "roles": {SS: roles},
                      "createdAt": {N: membership.createdAt.N},
                      "updatedAt": {N: now.toString()}
                    }
                  }
                }
              ]}};
          dynamodb.batchWriteItem(params, function (err, data) {
            if (err) {
              console.log(err, err.stack);
              console.log("    ERROR !");
            } else {
              console.log(data);
              console.log("    DONE !");
            }
          });
          console.log("    remove old Item: " + membership.id.S);
          params = {
            Key: {
              "id": { S: membership.id.S }
            },
            TableName: "GraviteeioApimMembership"
          };
          dynamodb.deleteItem(params, function(err, data) {
            if (err) {
              console.log(err, err.stack);
              console.log("    ERROR !");
            } else {
              console.log(data);
              console.log("    DONE !");
            }
          });

        } else {
          console.log("    add roles");
          let params = {
            ExpressionAttributeNames: {
              "#R": "roles",
              "#U": "updatedAt"
            },
            ExpressionAttributeValues: {
              ":r": { SS: roles },
              ":upd": { N: now.toString() }
              },
            Key: {"id": {S: membershipId}},
            TableName: "GraviteeioApimMembership",
            UpdateExpression: "SET #R = :r, #U = :upd"
          };
          dynamodb.updateItem(params, function (err, data) {
            if (err) {
              console.log(err, err.stack);
              console.log("    ERROR !");
            } else {
              console.log(data);
              console.log("    DONE !");
            }
          });
        }
      }
    }
  }
});
