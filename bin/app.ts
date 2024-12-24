#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { mainStack } from '../lib/stack-main';

const app           = new cdk.App();
const environment   = process.env.ENVIRONMENT         || 'dev';
const account       = process.env.CDK_DEFAULT_ACCOUNT || '320324805378';
const region        = process.env.CDK_DEFAULT_REGION  || 'us-east-1';

const main_stack = new mainStack(app, 'main-stack', {
  env: { 
    account: account, 
    region: region 
  },
});
cdk.Tags.of(main_stack).add('environment', environment);

app.synth();
