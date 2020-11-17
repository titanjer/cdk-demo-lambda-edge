# This is a CDK demo for Lambda@Edge

We use lambda@edge to validate app version in request user-agent.

```console
$ npx cdk deploy "*"
$ URL=$(aws cloudformation describe-stacks --stack-name CloudfrontStack --query "Stacks[0].Outputs[?OutputKey=='CloudfrontDomainName'].OutputValue"  --output text)
$ curl $URL -o /dev/null -sw "status code: %{http_code}\n" -A "funapp|64402301|50000f41caeee80a07970000|android|28"
status code: 200
$ curl $URL -o /dev/null -sw "status code: %{http_code}\n" -A "funapp|64402300|50000f41caeee80a07970000|android|28"
status code: 426
```