import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CodePipeline, CodePipelineSource, ManualApprovalStep, ShellStep, Wave } from 'aws-cdk-lib/pipelines';
import { pipelineStage } from './stage-pipeline';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';

export class MainStack extends cdk.Stack {

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const githubOrg = StringParameter.valueForStringParameter(this, '/cdk-demo/github/org');
    const githubRepo = StringParameter.valueForStringParameter(this, '/cdk-demo/github/repo');
    const githubBranch = StringParameter.valueForStringParameter(this, '/cdk-demo/github/branch');
    const connArn = StringParameter.valueForStringParameter(this, '/cdk-demo/github/conn-arn');

    // create a pipeline
    const pipeline = new CodePipeline(this, 'main', {
      selfMutation:     true,
      crossAccountKeys: true,
      reuseCrossRegionSupportStacks: true,
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.connection(
          `${githubOrg}/${githubRepo}`, 
          githubBranch,
          {
            connectionArn: connArn
          }
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
    const testWave = pipeline.addWave(`TestWave`);
    testWave.addPre(new ManualApprovalStep('ApprovalStep'));
    testWave.addStage(new pipelineStage(this, `TestStage`));
  }

}
