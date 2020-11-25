import * as path from 'path';
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as origins from '@aws-cdk/aws-cloudfront-origins';
import * as iam from '@aws-cdk/aws-iam';
import * as lambda from '@aws-cdk/aws-lambda';
import { PythonFunction } from '@aws-cdk/aws-lambda-python';
import * as s3deployment from '@aws-cdk/aws-s3-deployment';
import { App, Construct, Stack, StackProps, CfnOutput, RemovalPolicy } from '@aws-cdk/core';
import { StackOutputs } from 'cdk-remote-stack';
import { BucketNg } from 'cdk-s3bucket-ng';


export class LambdaEdgeStack extends Stack {

  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);

    const managedPolicyArn = iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole');

    const func = new PythonFunction(this, 'LambdaEdgeFunction', {
      entry: path.join(__dirname, './lambda/lambda-edge'),
      handler: 'handler',
      runtime: lambda.Runtime.PYTHON_3_8,
      role: new iam.Role(this, 'EdgeLambdaServiceRole', {
        assumedBy: new iam.CompositePrincipal(
          new iam.ServicePrincipal('lambda.amazonaws.com'),
          new iam.ServicePrincipal('edgelambda.amazonaws.com'),
        ),
        managedPolicies: [managedPolicyArn],
      }),
    });

    new CfnOutput(this, 'LambdaFuncArn', { value: func.currentVersion.functionArn });
  }
}

export interface CloudfrontStackProps extends StackProps {
  readonly lambdaStack: LambdaEdgeStack;
}

export class CloudfrontStack extends Stack {
  constructor(scope: Construct, id: string, props: CloudfrontStackProps) {
    super(scope, id, props);

    // create an S3 bucket to be cloufront origin
    const bucket = new BucketNg(this, 'Files', {
      websiteIndexDocument: 'index.html',
      publicReadAccess: true,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    new s3deployment.BucketDeployment(this, 'Deployment', {
      sources: [s3deployment.Source.asset(path.join(__dirname, './files'))],
      destinationBucket: bucket,
    });

    const origin = new origins.S3Origin(bucket);
    const originRequestPolicy = new cloudfront.OriginRequestPolicy(this, 'OriginRequestPolicy', {
      queryStringBehavior: {
        behavior: 'all',
      },
    });

    // get lambda@edge function ARN by cdk-remote-stack
    const outputs = new StackOutputs(this, 'LambdaFuncArn', {
      stack: props.lambdaStack,
    });
    const lambdaEdgeFuncArn = outputs.getAttString('LambdaFuncArn');

    // create a cloudfront distribution
    const cf = new cloudfront.Distribution(this, 'Cloudfront', {
      defaultBehavior: {
        origin,
        originRequestPolicy,
        edgeLambdas: [
          {
            functionVersion: lambda.Version.fromVersionArn(this, 'LambdaEdgeFunctionArn', lambdaEdgeFuncArn),
            eventType: cloudfront.LambdaEdgeEventType.VIEWER_REQUEST,
          },
        ],
      },
      comment: 'cloudfront-test',
    });

    // output values
    new CfnOutput(this, 'LambdaEdgeFuncArn', { value: lambdaEdgeFuncArn });
    new CfnOutput(this, 'CloudfrontDomainName', { value: `https://${cf.domainName}/data` });
    new CfnOutput(this, 'S3BucketName', { value: bucket.bucketName });
  }
}

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const evnUS = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: 'us-east-1',
};

const app = new App();

const lambdaEdgeStack = new LambdaEdgeStack(app, 'LambdaEdgeStack', { env: evnUS });

const cloudfrontStack = new CloudfrontStack(app, 'CloudfrontStack', { env, lambdaStack: lambdaEdgeStack });
cloudfrontStack.addDependency(lambdaEdgeStack);

app.synth();