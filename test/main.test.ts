import '@aws-cdk/assert/jest';
import { App } from '@aws-cdk/core';
import { CloudfrontStack, LambdaEdgeStack } from '../src/main';

test('Snapshot', () => {
  const app = new App();

  const mockMath = Object.create(global.Math);
  mockMath.random = () => 0.5;
  global.Math = mockMath;

  const lambdaEdgeStack = new LambdaEdgeStack(app, 'LambdaEdgeStack');
  const stack = new CloudfrontStack(app, 'CloudfrontStack', { lambdaStack: lambdaEdgeStack });

  expect(stack).toHaveResource('AWS::S3::Bucket');
  expect(app.synth().getStackArtifact(stack.artifactId).template).toMatchSnapshot();
});