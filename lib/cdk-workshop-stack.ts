import { Stack, StackProps } from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import { HitCounter } from "./hit-counter";

export class CdkWorkshopStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    const hello = new NodejsFunction(this, "HelloHandler", {
      runtime: lambda.Runtime.NODEJS_18_X, // execution environment
      entry: "lambda/hello.ts", // file is "hello.ts"
      handler: "index.handler", // file is "hello.ts" is bundeled into index.js, where the function is "handler"
    });

    const helloWithCounter = new HitCounter(this, "HelloHitCounter", {
      downstream: hello,
    });

    const api = new apigw.LambdaRestApi(this, "Endpoint", {
      handler: helloWithCounter.handler,
    });
  }
}
