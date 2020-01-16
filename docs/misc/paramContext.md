#AWS Lambda Function Context Parameter

Contains information about the invocation, function, and execution environment.

##Context Methods

`getRemainingTimeInMillis()` – Returns the number of milliseconds left before the execution times out.

##Context Properties

* `functionName` – The name of the Lambda function.

* `functionVersion` – The version of the function.

* `invokedFunctionArn` – The Amazon Resource Name (ARN) that's used to invoke the function. Indicates if the invoker specified a version number or alias.

* `memoryLimitInMB` – The amount of memory that's allocated for the function.

* `awsRequestId` – The identifier of the invocation request.

* `logGroupName` – The log group for the function.

* `logStreamName` – The log stream for the function instance.

* `identity` – (mobile apps) Information about the Amazon Cognito identity that authorized the request.

    - `cognitoIdentityId` – The authenticated Amazon Cognito identity.

    - `cognitoIdentityPoolId` – The Amazon Cognito identity pool that authorized the invocation.

* `clientContext` – (mobile apps) Client context that's provided to Lambda by the client application.

    - `client.installation_id`

    - `client.app_title`

    - `client.app_version_name`

    - `client.app_version_code`

    - `client.app_package_name`

    - `env.platform_version`

    - `env.platform`

    - `env.make`

    - `env.model`

    - `env.locale`

    - `Custom` – Custom values that are set by the mobile application.

* `callbackWaitsForEmptyEventLoop` – Set to false to send the response right away when the callback executes, instead of waiting for the Node.js event loop to be empty. If this is false, any outstanding events continue to run during the next invocation.

