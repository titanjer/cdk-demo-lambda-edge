const { AwsCdkTypeScriptApp } = require('projen');

const project = new AwsCdkTypeScriptApp({
  cdkVersion: '1.74.0',
  name: 'cdk-lambda-edge',
  cdkDependencies: [
    '@aws-cdk/aws-cloudfront',
    '@aws-cdk/aws-cloudfront-origins',
    '@aws-cdk/aws-iam',
    '@aws-cdk/aws-lambda',
    '@aws-cdk/aws-lambda-python',
    '@aws-cdk/aws-s3',
    '@aws-cdk/aws-s3-deployment',
  ],
  deps: [
    'cdk-remote-stack',
    'cdk-s3bucket-ng',
  ],
  dependabot: false,
});

project.synth();
