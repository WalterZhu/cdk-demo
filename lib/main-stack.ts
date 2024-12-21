import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CodePipeline, CodePipelineSource, ManualApprovalStep, ShellStep, Wave } from 'aws-cdk-lib/pipelines';
import { StackProps } from 'aws-cdk-lib';
import { pipelineAppStage } from './pipeline';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';

export interface MainStackProps extends StackProps {
    readonly githubOrg: string;
    readonly githubRepo: string;
    readonly githubBranch: string;
    readonly connArn: string;
    readonly devEnv: string;
}

export class mainStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: MainStackProps) {
    super(scope, id, props);

    // create a pipeline
    const pipeline = new CodePipeline(this, 'pipeline', {
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

    // add a stage to the pipeline
    const devStage = pipeline.addStage(new pipelineAppStage(this, `${props.devEnv}`, { 
      env: { account: '123456789012', region: 'us-east-1' }
    }));
    // add a manual approval step
    devStage.addPost(new ManualApprovalStep('approval'));

    // add waves to the pipeline
    const devWave = pipeline.addWave(`${props.devEnv}-Wave`);
    devWave.addStage(new pipelineAppStage(this, `${props.devEnv}-Primary`, {
      env: { account: '123456789012', region: 'us-east-1' }
    }));
    devWave.addStage(new pipelineAppStage(this, `${props.devEnv}-Secondary`, {
      env: { account: '123456789012', region: 'us-west-2' }
    }));

  }
}
