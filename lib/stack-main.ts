import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CodePipeline, CodePipelineSource, ManualApprovalStep, ShellStep, Wave } from 'aws-cdk-lib/pipelines';
import { pipelineStage } from './stage-pipeline';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { StringParameter } from 'aws-cdk-lib/aws-ssm'

interface PipelineConfig {
  githubOrg: string;
  githubRepo: string;
  githubBranch: string;
  connArn: string;
}

export class MainStack extends cdk.Stack {

  private getConfig(scope: Construct): PipelineConfig {
    return {
      githubOrg: process.env.GITHUB_ORG || 
        StringParameter.valueForStringParameter(scope, '/cdk-demo/github/org'),
      githubRepo: process.env.GITHUB_REPO || 
        StringParameter.valueForStringParameter(scope, '/cdk-demo/github/repo'),
      githubBranch: process.env.GITHUB_BRANCH || 
        StringParameter.valueForStringParameter(scope, '/cdk-demo/github/branch'),
      connArn: process.env.CONN_ARN || 
        StringParameter.valueForStringParameter(scope, '/cdk-demo/conn-arn'),
    };
  }

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const config = this.getConfig(this);

    // create a pipeline
    const pipeline = new CodePipeline(this, 'main', {
      selfMutation:     true,
      crossAccountKeys: true,
      reuseCrossRegionSupportStacks: true,
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.connection(
          `${config.githubOrg}/${config.githubRepo}`, 
          config.githubBranch,
          { connectionArn: `${config.connArn}` }
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
