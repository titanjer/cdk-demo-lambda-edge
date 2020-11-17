# This is a CDK demo for Lambda@Edge

We use lambda@edge to validate app version in request user-agent. The second parts in user-agent `funapp|64402301|50000f41caeee80a07970000|android|28` is the app version. Please check out the demo below.

```console
$ npx projen
$ npx cdk deploy "*"
$ URL=$(aws cloudformation describe-stacks \
        --stack-name CloudfrontStack \
        --query "Stacks[0].Outputs[?OutputKey=='CloudfrontDomainName'].OutputValue" \
        --output text)
$ curl -A "funapp|64402301|50000f41caeee80a07970000|android|28" $URL -o /dev/null -sw "> %{http_code}\n"
> 200
$ curl -A "funapp|64402300|50000f41caeee80a07970000|android|28" $URL -o /dev/null -sw "> %{http_code}\n"
> 426
```

Special thanks to [pahud/cdk-remote-stack](https://github.com/pahud/cdk-remote-stack) to integrate cloudfront and lambda@edge and [guan840912/cdk-s3bucket](https://github.com/guan840912/cdk-s3bucket) for clean S3 demo.

Enjoy coding!