MOS API
===========

This documentation pertains to software in development as of 1/1/2020. This will replace Neso, the onsite server that supports The Hub.

Client, data, and their documentation are separate.

Technical Brief
---------------
Prerequisite skills for understanding code: ES6, AWS (especially Lambda / serverless), and MongoDB Atlas


You'll need installed globally to perform local testing: lambda-local

You'll need AWS credentials stored locally to push local changes to AWS: https://docs.aws.amazon.com/cli/latest/userguide//cli-configure-files.html


Done so far
--------------
Relevant docs: 
* https://www.mongodb.com/blog/post/introducing-vpc-peering-for-mongodb-atlas?jmp=adref
* https://docs.atlas.mongodb.com/security-vpc-peering/
* https://docs.aws.amazon.com/vpc/latest/userguide/VPC_Route_Tables.html
* https://docs.microsoft.com/en-us/graph/auth-register-app-v2
* https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-permissions-and-consent

Actions:
* In MongoDB Atlas
	- Signed up for account as sp1@mos.org. Allie added payment info.
	- Named Org "Museum of Science, Boston".
	- Named Project "MOS API".
	- Created Cluster named "dev-api".
	- In Database Access settings, created user with admin privileges named "rootAnything". To Do - James has password, but it must be added to password database.
	- In Database Access settings, created user with readWriteAnyDatabase privelegs named "aws-user". To Do - James has password, but it must be added to password database.
	- In Network Access settings, in IP Whitelist,
		* Whitelisted IP for Rousseau, a jbaker local development machine (using Ubuntu 17.10).
		* Whitelisted IP for everything (0.0.0.0/0). To DO - remove this once Peering is verified.
	- In Network Access settings, in Peering, created a new Peering Connection request with the following inputs:
		* Cloud Provider: AWS
		* Account ID: 344440222217
		* VPC ID: vpc-39381943
		* VPC CIDR: 172.31.0.0/16
		* Application VPC Region: us-east-1
		* Atlas VPC Region: us-east-1.
* In Microsoft Azure
	- In App Registrations, created (registered) new application with the following properties:
		* Display name: MOS MSGraph App
		* Application (client) ID: cb48f3b1-c0d1-441c-a1c4-957123430bd6
		* Directory (tenant) ID: 2fb952ea-55b8-42e8-8f13-37dc0d888d4d
		* Object ID: 82bda524-4202-4a3c-9379-229546052f5b
		* Supported account types: My organization only
	- In the new app's settings, 
		* In API permissions, granted Microsoft Graph API permissions as decribed in [Microsoft Graph Permissions](architecture/graph-permissions.md)
		* In API permissions, granted admin consent on behalf of Museum for the specified app permissions.
		* In Certificates & secrets, created client secret as follows:
			* Description: MOS API client secret
			* Expires: Never
		* In Owners, added sp1 as an owner
* In AWS
	- In VPCs, Your VPCs, found only existing VPC (ID: vpc-39381943) and used its info to request a new Peering Connection in MongoDB Atlas.
	- In VPCs, Peering Connections, accepted Peering Connection request
	- In VPCs, Route Tables, for the only existing Route Table (ID: rtb-59bc1027), gave it the name "Main Route Table" and added Route with following inputs:
		* Destination: 192.168.248.0/21 <<< This is the Atlas CIDR Block
		* Target: pcx-0e7896137c16ffcba <<< This is the Peering Connection's ID inside AWS
	- In IAM, created user to be used for programmatic access with name "mos-api-sls-admin". Note that although this user inherits broad permissions from the Web_Team group, each Lambda function will be associated with a custome IAM role that allows it to access **only** the resources for Lambda functions plus the resources explicitly specified by the Lambda function's developer.
	To Do - James has key and secret, but they must be added to password database.
	- In AWS System Manager, Parameter Store, stored the following parameters:
		* dev-atlas-cxn-str - MongoDB Atlas - connection string for "dev-api" cluster
		* prod-atlas-cxn-str - MongoDB Atlas - connection string for "prod-api" cluster
		* graph-client-id - Microsoft Graph API - Client ID
		* graph-client-secret - Microsoft Graph API - Client Secret
		* graph-tenant-id - Microsoft Graph API - Tenant ID
		* up-api-key - UltiPro - US Customer Api Key
		* up-emp-changes-pw - UltiPro EmployeeChanges API - Password
		* up-emp-changes-user - UltiPro EmployeeChanges API - Username




