import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { StackProps } from 'aws-cdk-lib';

export interface MainStackProps extends StackProps {
    readonly githubOrg: string;
    readonly githubRepo: string;
    readonly githubBranch: string;
    readonly devEnv: string;
}

export class mainStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: MainStackProps) {
    super(scope, id, props);

  }
}
