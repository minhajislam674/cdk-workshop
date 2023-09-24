import { DynamoDB, Lambda } from "aws-sdk";

export const handler = async (event: any) => {
  console.log("request:", JSON.stringify(event, undefined, 2));

  // creates instances of the DynamoDB and Lambda classes from the aws-sdk module.
  const dynamo = new DynamoDB();
  const lambda = new Lambda();

  // Retrieves the names of the DynamoDB table and downstream Lambda function from environment variables. These variables are set in the CDK code.
  const tableName = process.env.HITS_TABLE_NAME as string;
  const functionName = process.env.DOWNSTREAM_FUNCTION_NAME as string;

  // Update the table
  await dynamo
    .updateItem({
      TableName: tableName,
      Key: { path: { S: event.path } },
      UpdateExpression: "ADD hits :incr",
      ExpressionAttributeValues: { ":incr": { N: "1" } },
    })
    .promise();

  // Invoke downstream lambda function
  const resp = await lambda
    .invoke({
      FunctionName: functionName,
      Payload: JSON.stringify(event),
    })
    .promise();

  // logs the response from the downstream Lambda function and returns it to the caller.
  console.log("downstream response:", JSON.stringify(resp, undefined, 2));
  return JSON.parse(resp.Payload as string);
};
