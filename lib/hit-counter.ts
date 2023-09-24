import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";

export interface HitCounterProps {
  downstream: lambda.IFunction;
}

export class HitCounter extends Construct {
  public readonly handler: lambda.Function;

  constructor(scope: Construct, id: string, props: HitCounterProps) {
    super(scope, id);

    // defines a DynamoDB table with a single attribute: path, which is the partition key.
    const table = new dynamodb.Table(this, "Hits", {
      partitionKey: { name: "path", type: dynamodb.AttributeType.STRING },
    });

    // defines a Lambda function using the NodejsFunction class that will be used to process requests and update the hitcounter.
    this.handler = new NodejsFunction(this, "HitCounterHandler", {
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: "lambda/hitcounter.ts",
      handler: "index.handler",
      environment: {
        // passes the name of the table and downstream function to the Lambda function via environment variables.
        DOWNSTREAM_FUNCTION_NAME: props.downstream.functionName,
        HITS_TABLE_NAME: table.tableName,
      },
    });

    // grants the Lambda function read/write permissions to the table. This is required so that the function can increment the hit counter.
    table.grantReadWriteData(this.handler);

    // grants the Lambda function invoke permissions to the downstream function. This is required so that the function can invoke the downstream function.
    props.downstream.grantInvoke(this.handler);
  }
}
