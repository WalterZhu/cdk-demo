import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CodePipeline, CodePipelineSource, ManualApprovalStep, ShellStep, Wave } from 'aws-cdk-lib/pipelines';
import { pipelineStage } from './stage-pipeline';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';

const githubOrg     = process.env.GITHUB_ORG          || 'WalterZhu' 
const githubRepo    = process.env.GITHUB_REPO         || 'cdk-demo'; 
const githubBranch  = process.env.GITHUB_BRANCH       || 'main'; 
const connArn       = process.env.CONN_ARN            || 'arn:aws:codeconnections:us-east-1:320324805378:connection/0dbfba8c-4dd2-448a-9cd0-d36922e3dcb1'; 

export class mainStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);

    // create a pipeline
    const pipeline = new CodePipeline(this, 'main', {
      selfMutation:     true,
      crossAccountKeys: true,
      reuseCrossRegionSupportStacks: true,
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.connection(
          `${githubOrg}/${githubRepo}`, 
          githubBranch,
          { connectionArn: connArn }
        ),
        commands: [
          'npm ci',
          'npm run build',
          'npx cdk synth'
        ]
      }),
      synthCodeBuildDefaults: {
        rolePolicy: [
          new PolicyStatement({
            resources: [ '*' ],
            actions: [ 'ec2:DescribeAvailabilityZones' ],
          }),
        ]
      }
    });

    // add waves to the pipeline
    const testWave = pipeline.addWave(`Test-Wave`);
    testWave.addPre(new ManualApprovalStep('approval'));
    testWave.addStage(new pipelineStage(this, `Test-stage`));
  }
}
