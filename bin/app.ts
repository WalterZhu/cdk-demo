#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { mainStack } from '../lib/stack-main';

const app           = new cdk.App();
const githubOrg     = process.env.GITHUB_ORG      || 'WalterZhu' 
const githubRepo    = process.env.GITHUB_REPO     || 'cdk-demo'; 
const githubBranch  = process.env.GITHUB_BRANCH   || 'main'; 
const connArn       = process.env.CONN_ARN        || 'arn:aws:codeconnections:us-east-1:320324805378:connection/0dbfba8c-4dd2-448a-9cd0-d36922e3dcb1'; 

const main_stack = new mainStack(app, 'main-stack', {
  env: { 
    account: '320324805378', 
    region: 'us-east-1' 
  },
  githubOrg,
  githubRepo,
  githubBranch,
  connArn,
});
cdk.Tags.of(main_stack).add('environment', 'test');

app.synth();
