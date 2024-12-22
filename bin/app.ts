#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { mainStack } from '../lib/stack-main';

const app           = new cdk.App();
const devEnv        = process.env.DEV_ENV         || "dev"; 
const githubOrg     = process.env.GITHUB_ORG      || StringParameter.valueForStringParameter(app, '/cdk-demo/github/org');
const githubRepo    = process.env.GITHUB_REPO     || StringParameter.valueForStringParameter(app, '/cdk-demo/github/repo');
const githubBranch  = process.env.GITHUB_BRANCH   || StringParameter.valueForStringParameter(app, '/cdk-demo/github/branch');
const connArn       = process.env.CONN_ARN        || StringParameter.valueForStringParameter(app, '/cdk-demo/github/conn-arn'); 

const main_stack = new mainStack(app, 'main-stack', {
    devEnv,
    githubOrg,
    githubRepo,
    githubBranch,
    connArn,
});
cdk.Tags.of(main_stack).add('environment', devEnv);

app.synth();
