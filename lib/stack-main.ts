import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CodePipeline, CodePipelineSource, ManualApprovalStep, ShellStep, Wave } from 'aws-cdk-lib/pipelines';
import { pipelineStage } from './stage-pipeline';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';

export interface MainStackProps extends cdk.StackProps {
  readonly githubOrg: string;
  readonly githubRepo: string;
  readonly githubBranch: string;
  readonly connArn: string;
}

export class mainStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: MainStackProps) {
    super(scope, id, props);

    // create a pipeline
    const pipeline = new CodePipeline(this, 'main', {
      selfMutation:     true,
      crossAccountKeys: true,
      reuseCrossRegionSupportStacks: true,
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.connection(`${props.githubOrg}/${props.githubRepo}`, `${props.githubBranch}`,{
          connectionArn: `${props.connArn}`
        }),
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

    /*
    testWave.addStage(new pipelineStage(this, `Deploy-stage`, {
      env: { account: '123456789012', region: 'us-west-2' }
    }));
    */

  }
}
