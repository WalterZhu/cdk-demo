import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CodePipeline, CodePipelineSource, ManualApprovalStep, ShellStep, Wave } from 'aws-cdk-lib/pipelines';
import { pipelineStage } from './stage-pipeline';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';

export class MainStack extends cdk.Stack {

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // create a pipeline
    const pipeline = new CodePipeline(this, 'main', {
      selfMutation:     true,
      crossAccountKeys: true,
      reuseCrossRegionSupportStacks: true,
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.connection(
          'WalterZhu/cdk-demo', 
          'main',
          {
            connectionArn: 'arn:aws:codeconnections:us-east-1:320324805378:connection/0dbfba8c-4dd2-448a-9cd0-d36922e3dcb1'
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

    // create wave of dev stage 
    const devWave = new Wave('DevWave');
    devWave.addStage(new pipelineStage(this, `DevStage`, {
      env: { account: '320324805378', region: 'us-east-2' },
    }));
    pipeline.addWave('DevWave', devWave);

    // create wave of test stage 
    const testWave = pipeline.addWave(`TestWave`);
    testWave.addPre(new ManualApprovalStep('ApprovalStep'));
    testWave.addStage(new pipelineStage(this, `TestStage`));
  }

}
