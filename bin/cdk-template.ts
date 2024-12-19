#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { CdkTemplateStack } from '../lib/cdk-template-stack';

const app = new cdk.App();
new CdkTemplateStack(app, 'CdkTemplateStack');
