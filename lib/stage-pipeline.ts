import * as cdk from 'aws-cdk-lib';
import { Construct } from "constructs";
import { vpcStack } from './stack-vpc';
import { lambdaApiStack } from './stack-lambda-api';
import { ecsFargateStack } from './stack-ecs-fargate';
import { rdsAuroraStack } from './stack-datastore';
import { asyncLambdaStack } from './stack-async-lambda';

export class pipelineStage extends cdk.Stage {

  constructor(scope: Construct, id: string, props?: cdk.StageProps) {

    super(scope, id, props);

    /*
    // vpc stack 
    const vpc_stack = new vpcStack(this, 'VpcStack');
    cdk.Tags.of(vpc_stack).add('environment', 'dev');

    // ecs fargate stack
    const ecs_fargate_stack = new ecsFargateStack(this, 'EcsFargateStack', {
      vpc: vpc_stack.vpc,
    });
    cdk.Tags.of(ecs_fargate_stack).add('environment', 'dev');

    // rds aurora stack
    const rds_aurora_stack = new rdsAuroraStack(this, 'RdsAuroraStack', {
      vpc: vpc_stack.vpc,
    });
    cdk.Tags.of(rds_aurora_stack).add('environment', 'dev');
    */

    /*
    // lambda api stack
    const lambda_api_stack = new lambdaApiStack(this, 'LambdaApiStack');
    cdk.Tags.of(lambda_api_stack).add('environment', 'dev');
    */

    // lambda async stack
    const async_lambda_stack = new asyncLambdaStack(this, 'AsyncLambdaStack');
    cdk.Tags.of(async_lambda_stack).add('environment', 'test');

  }
}