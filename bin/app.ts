#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { mainStack } from '../lib/main-stack';

const app           = new cdk.App();
const devEnv        = process.env.DEV_ENV         || "dev"; 
const githubOrg     = process.env.GITHUB_ORG      || "";
const githubRepo    = process.env.GITHUB_REPO     || "";
const githubBranch  = process.env.GITHUB_BRANCH   || "";
const connArn       = process.env.CONN_ARN        || ""; 
const author        = process.env.ADMIN           || "";

const main_stack = new mainStack(app, 'main-stack', {
    devEnv,
    githubOrg,
    githubRepo,
    githubBranch,
    connArn,
});
cdk.Tags.of(main_stack).add('managedBy', author);
cdk.Tags.of(main_stack).add('environment', devEnv);

app.synth();
