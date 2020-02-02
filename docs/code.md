#Code Reference
##Index

* [Repo](https://github.com/HubTester1/HubAPI)
* [Agenda](#agenda)
* [APIs](#apis)
{% collapse title="- Individual APIs"%}
- [Email API](#email-api)
- [Kitten API](#kitten-api)
{% endcollapse %}
* [Layers](#layers)
{% collapse title="- Individual Layers"%}
- [NPM Layer](#npm-layer)
- [Services Layer](#services-layer)
{% endcollapse %}
* [Services](#services)
{% collapse title="- Individual Services"%}
- [DataConnection Service](#dataconnection-service)
- [DataQueries Service](#dataqueries-service)
- [Email Service](#email-service)
- [MSGraph Service](#msgraph-service)
- [UltiPro Service](#ultipro-service)
- [Utilities Service](#utilities-service)
{% endcollapse %}

##Agenda
| *@todo* | path |
| ----------- | ----------- |
| Unwhitelist 0.0.0.0/0 | /meta/agenda.js |
| review 12 factors | /meta/agenda.js |
| Develop the basic services | /meta/agenda.js |
| BIG PIC - People Data | /meta/agenda.js |
| BIG PIC - Send email through Graph | /meta/agenda.js |
| BIG PIC - Pull data from SPO | /meta/agenda.js |
| BIG PIC - Serve client from AWS through SPO | /meta/agenda.js |
| cron process queue | /src/Services/-dev-Email/index.js |
| cron log | /src/Services/-dev-Email/index.js |
| sending status | /src/Services/-dev-Email/index.js |
| queue processing status | /src/Services/-dev-Email/index.js |
| error handling | /src/Services/-dev-Email/index.js |
| access through domain or token | /src/Services/-dev-Email/index.js |

&nbsp;

[Return to Index](#index)
&nbsp;

&nbsp;

&nbsp;

---
&nbsp;

&nbsp;

##APIs
Each API is essentially a collection of Lambda functions. Each function has access to all layers. 
			Each function receives three params from the AWS Lambda service.
			{% collapse title="> Params"%}
| *@param* | type | required | description |
| --- |: --- :|: --- :| --- |
| event | object | | Contains information from the invoker, Amazon API Gateway. [Get details of the event parameter](/misc/paramEvent.html)|
| context | object | | Contains information about the invocation, function, and execution environment. [Get details of the context parameter](/misc/paramContext.html)|
| callback | function | | In synchronous functions, call this function to send the response. The callback function takes two arguments: an Error and a response. When you call it, Lambda waits for the event loop to be empty and then returns the response or error to the invoker. The response object must be compatible with JSON.stringify. |
{% endcollapse %}
###Email API

Handles all email-related requests.

> /src/Lambdas/API/-dev-Email/index.js

####Functions

#####HandleSendEmailRequest
Handle request to send email.


&nbsp;

###Kitten API

Just a sample / testing API

> /src/Lambdas/API/-dev--Kittens/index.js

####Functions

#####InsertKitten
This is the kitten insertion function in the Kitten API.


&nbsp;


&nbsp;

[Return to Index](#index)
&nbsp;

&nbsp;

&nbsp;

---
&nbsp;

&nbsp;

##Layers
AWS Lambda Layers contain modules (i.e., code), either MOS or contributed, that is external to but relied upon and accessed by Lambda functions (i.e., dependencies).
###NPM Layer

This AWS Lambda Layer contains third-party Node.js modules from [NPM](https://www.npmjs.com).

> /src/Layers/-dev-NPM


&nbsp;

###Services Layer

This AWS Lambda Layer contains MOS modules.

> /src/Layers/-dev-Services


&nbsp;


&nbsp;

[Return to Index](#index)
&nbsp;

&nbsp;

&nbsp;

---
&nbsp;

&nbsp;

##Services
Services are MOS modules that are used in an AWS Lambda Layer. [Learn more about Layers](#layers)
###DataConnection Service

Return connection to either dev or prod database in MongoDB Atlas service.

> /src/Services/-dev-DataConnection/index.js

####Functions
#####ReturnDataConnection
Return [monk](https://www.npmjs.com/package/monk) connection to database, using environment variables


&nbsp;

###DataQueries Service

Using DataConnection service, facilitate queries of databases in MongoDB Atlas service.

> /src/Services/-dev-DataQueries/index.js

####Functions
#####ReturnAllDocsFromCollection
Return all documents from a collection

{% collapse title="> Params"%}
| *@param* | type | required | description |
| --- |: --- :|: --- :| --- |
| collection | string | true | e.g., '_Kittens'  |
{% endcollapse %}

&nbsp;

###Email Service

Performs all email-related operations.

> /src/Services/-dev-Email/index.js

####Functions
#####AddEmailToArchive
Add the email to the archive, i.e., the doc to the 'emailArchive' collection.

{% collapse title="> Params"%}
| *@param* | type | required | description |
| --- |: --- :|: --- :| --- |
| incomingEmail | object | true | One email <br> *(/src/TypeDefs/Email.js)*  |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.event | string |  | flag, archived, indicating type of  email; useful for filtering archive; e.g., 'approved admin'  |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.from | string | true | email address string; must correspond to a  user in the MOS O365 tenancy; e.g., 'sp1@mos.org', 'Hub Tester1 &lt;sp1@mos.org&gt;'  |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.html | string |  | HTML email body  |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.subject | string | true | e.g., 'This is a subject'  |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.system | string |  | flag, archived, indicating system  generating this email; useful for filtering archive; e.g., 'hub'  |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.text | string |  | plain text (non-HTML) email body  |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.to | string &#124; Array | true | email address string or array email  address strings; e.g., ['sp1@mos.org', 'Hub Tester1 &lt;sp1@mos.org&gt;']  |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.type | string |  | flag, archived, indicating type of  email; useful for filtering archive; e.g., 'notification'  |
{% endcollapse %}
#####AddEmailToQueue
Add the email to the queue, i.e., the doc to the 'emailQueue' collection.

{% collapse title="> Params"%}
| *@param* | type | required | description |
| --- |: --- :|: --- :| --- |
| incomingEmail | object | true | {@link Email} object  |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.event | string |  | flag, archived, indicating type of  email; useful for filtering archive; e.g., 'approved admin'  |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.from | string | true | email address string; must correspond to a  user in the MOS O365 tenancy; e.g., 'sp1@mos.org', 'Hub Tester1 &lt;sp1@mos.org&gt;'  |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.html | string |  | HTML email body  |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.subject | string | true | e.g., 'This is a subject'  |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.system | string |  | flag, archived, indicating system  generating this email; useful for filtering archive; e.g., 'hub'  |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.text | string |  | plain text (non-HTML) email body  |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.to | string &#124; Array | true | email address string or array email  address strings; e.g., ['sp1@mos.org', 'Hub Tester1 &lt;sp1@mos.org&gt;']  |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.type | string |  | flag, archived, indicating type of  email; useful for filtering archive; e.g., 'notification'  |
{% endcollapse %}
#####DeleteArchivedEmail
Delete one email from the archive, i.e., one doc in the 'emailArchive' collection.

{% collapse title="> Params"%}
| *@param* | type | required | description |
| --- |: --- :|: --- :| --- |
| emailID | string | true | ID of email to delete, i.e., of doc to remove  |
{% endcollapse %}
#####DeleteQueuedEmail
Delete one email from the queue, i.e., one doc in the 'emailQueue' collection.

{% collapse title="> Params"%}
| *@param* | type | required | description |
| --- |: --- :|: --- :| --- |
| emailID | string | true | ID of email to delete, i.e., of doc to remove  |
{% endcollapse %}
#####ProcessEmailQueue
For each email in the queue, attempt to send the email (including
archiving and deleting from queue).

#####ReplaceAllEmailSettings
Replace email settings object in database, i.e., doc in 'emailSettings' queue.

{% collapse title="> Params"%}
| *@param* | type | required | description |
| --- |: --- :|: --- :| --- |
| newSettings | object | true | object comprising new email settings  |
{% endcollapse %}
#####ReplaceArchivedEmail
Replace one email in the archive, i.e., one doc in the 'emailArchive' collection.

{% collapse title="> Params"%}
| *@param* | type | required | description |
| --- |: --- :|: --- :| --- |
| emailID | string | true | ID of email to replace, i.e., of doc to overwrite  |
| incomingEmail | object | true | One email <br> *(/src/TypeDefs/Email.js)*  |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.event | string |  | flag, archived, indicating type of  email; useful for filtering archive; e.g., 'approved admin'  |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.from | string | true | email address string; must correspond to a  user in the MOS O365 tenancy; e.g., 'sp1@mos.org', 'Hub Tester1 &lt;sp1@mos.org&gt;'  |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.html | string |  | HTML email body  |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.subject | string | true | e.g., 'This is a subject'  |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.system | string |  | flag, archived, indicating system  generating this email; useful for filtering archive; e.g., 'hub'  |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.text | string |  | plain text (non-HTML) email body  |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.to | string &#124; Array | true | email address string or array email  address strings; e.g., ['sp1@mos.org', 'Hub Tester1 &lt;sp1@mos.org&gt;']  |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.type | string |  | flag, archived, indicating type of  email; useful for filtering archive; e.g., 'notification'  |
{% endcollapse %}
#####ReplaceOneEmailSetting
Replace one email setting in database, i.e., one property of 
doc in 'emailSettings' queue.

{% collapse title="> Params"%}
| *@param* | type | required | description |
| --- |: --- :|: --- :| --- |
| newSingleSettingObject | object | true | object comprising new email setting property  |
{% endcollapse %}
#####ReplaceQueuedEmail
Replace one email in the queue, i.e., one doc in the 'emailQueue' collection.

{% collapse title="> Params"%}
| *@param* | type | required | description |
| --- |: --- :|: --- :| --- |
| emailID | string | true | ID of email to replace, i.e., of doc to overwrite  |
| incomingEmail | object | true | One email <br> *(/src/TypeDefs/Email.js)*  |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.event | string |  | flag, archived, indicating type of  email; useful for filtering archive; e.g., 'approved admin'  |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.from | string | true | email address string; must correspond to a  user in the MOS O365 tenancy; e.g., 'sp1@mos.org', 'Hub Tester1 &lt;sp1@mos.org&gt;'  |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.html | string |  | HTML email body  |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.subject | string | true | e.g., 'This is a subject'  |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.system | string |  | flag, archived, indicating system  generating this email; useful for filtering archive; e.g., 'hub'  |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.text | string |  | plain text (non-HTML) email body  |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.to | string &#124; Array | true | email address string or array email  address strings; e.g., ['sp1@mos.org', 'Hub Tester1 &lt;sp1@mos.org&gt;']  |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.type | string |  | flag, archived, indicating type of  email; useful for filtering archive; e.g., 'notification'  |
{% endcollapse %}
#####ReturnEmailArchiveData
Return all emails from the email archive 
(all docs from the 'emailArchive' collection).

#####ReturnEmailQueueData
Return all emails from the email queue 
(all docs from the 'emailQueue' collection).

#####ReturnEmailQueueProcessingStatus
Return the setting indicating whether or not email the email queue 
should be processed.This setting can be set to false in database to prevent queued emails
from being sent.

#####ReturnEmailSendingStatus
Return the setting indicating whether or not emails should be sent at this time.
This setting can be set to false in database to prevent emails from being sent.

#####ReturnEmailSettingsData
Return all email settings 
(all docs from the 'emailSettings' collection).

#####ReturnEmailWhitelistedDomains
Return the setting indicating the domains from which email requests are accepted.
Add a domain to this setting in database to all requests from an additional domain.

#####SendEachEmailFromArray
For each email in an array, attempt to send the email.

{% collapse title="> Params"%}
| *@param* | type | required | description |
| --- |: --- :|: --- :| --- |
| emailArray | Array.&lt;object&gt; | true | array of objects, each comprising data for one email  |
{% endcollapse %}
#####SendEmail
Send one email to MSGraph service. If Graph is 
successful in sending, add email to archive (and remove from queue, 
as appropriate). If Graph is not successful in sending, add email to 
queue.

{% collapse title="> Params"%}
| *@param* | type | required | description |
| --- |: --- :|: --- :| --- |
| incomingEmail | object | true | One email <br> *(/src/TypeDefs/Email.js)*  |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.event | string |  | flag, archived, indicating type of  email; useful for filtering archive; e.g., 'approved admin'  |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.from | string | true | email address string; must correspond to a  user in the MOS O365 tenancy; e.g., 'sp1@mos.org', 'Hub Tester1 &lt;sp1@mos.org&gt;'  |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.html | string |  | HTML email body  |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.subject | string | true | e.g., 'This is a subject'  |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.system | string |  | flag, archived, indicating system  generating this email; useful for filtering archive; e.g., 'hub'  |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.text | string |  | plain text (non-HTML) email body  |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.to | string &#124; Array | true | email address string or array email  address strings; e.g., ['sp1@mos.org', 'Hub Tester1 &lt;sp1@mos.org&gt;']  |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.type | string |  | flag, archived, indicating type of  email; useful for filtering archive; e.g., 'notification'  |
{% endcollapse %}

&nbsp;

###MSGraph Service

Query the Microsoft Graph API

> /src/Services/-dev-MSGraph/index.js

####Functions

&nbsp;

###UltiPro Service

Query the UltiPro EmployeeChangesAPI

> /src/Services/-dev-UltiPro/index.js

####Functions
#####ReturnAllEmployeesFromUltiPro
Return all employees from the UltiPro EmployeeChanges API. 
I.e., Return all of the pages.

#####ReturnOnePageOfEmployeesFromUltiPro
Return one page of employees from the UltiPro EmployeeChanges API. 
This is the one point of actual contact with the UltiPro EmployeeChanges API.

{% collapse title="> Params"%}
| *@param* | type | required | description |
| --- |: --- :|: --- :| --- |
| upApiKey |  | true | Environment variable, stored in AWS Systems Manager, Parameter store  |
| upEmployeeChangesPass |  | true | Environment variable, stored in AWS Systems Manager, Parameter store  |
| upEmployeeChangesUser |  | true | Environment variable, stored in AWS Systems Manager, Parameter store  |
| page |  | true | Which page to return  |
{% endcollapse %}
#####ReturnUltiProEmployeeChangesQueryConfig
Return URI and options for get query to UltiPro EmployeeChanges API

{% collapse title="> Params"%}
| *@param* | type | required | description |
| --- |: --- :|: --- :| --- |
| page |  | true | Which page to return  |
{% endcollapse %}

&nbsp;

###Utilities Service

Miscellaneous utility functions

> /src/Services/-dev-Utilities/index.js

####Functions
#####ReplaceAll
Return substring preceding '\r' and/or '\n' characters.

{% collapse title="> Params"%}
| *@param* | type | required | description |
| --- |: --- :|: --- :| --- |
| needle | string | true | string to search for  |
| replacementNeedle | string | true | string to replace needle  |
| haystack | string | true | string to search in  |
{% endcollapse %}
#####ReturnAccountFromUserAndDomain
Return substring preceding '@' character.

{% collapse title="> Params"%}
| *@param* | type | required | description |
| --- |: --- :|: --- :| --- |
| incomingString | string | true | e.g., 'sp1@mos.org'  |
{% endcollapse %}
#####ReturnArrayElementExists
Return true if element is in array, false if not.

{% collapse title="> Params"%}
| *@param* | type | required | description |
| --- |: --- :|: --- :| --- |
| testArray | string | true | array to test  |
| testElement | string | true | element for which to test  |
{% endcollapse %}
#####ReturnCopyOfObject
Return a deep / unique copy of an object 
(as opposed to a reference to the original object).

{% collapse title="> Params"%}
| *@param* | type | required | description |
| --- |: --- :|: --- :| --- |
| incomingObject | string | true | e.g., any valid object  |
{% endcollapse %}
#####ReturnFormattedDateTime
Use moment.js to calculate and format times. 
Present for backward compatibility; should use moment 
directly going forward.

{% collapse title="> Params"%}
| *@param* | type | required | description |
| --- |: --- :|: --- :| --- |
| incomingDateTimeString | string | true | predefined token or  moment-parsable representation of datetime;  e.g., 'nowLocal', 'nowUTC', 'April 19, 2020'  |
| incomingFormat | string &#124; null | true | null or moment-compatible  indication of format of incomingDateTimeString;  e.g., null, 'YYYY-MM-DDTHH:mm:ssZ'  |
| incomingReturnFormat | string &#124; null | true | null or moment-compatible  indication of format of datetime string to return;  e.g., null, 'YYYY-MM-DDTHH:mm:ssZ'  |
| determineYearDisplayDynamically | number &#124; null | true | if 1,  the datetime's year will only be included if it is not the current year;  e.g., null, 0, 1  |
{% endcollapse %}
#####ReturnSubstringPrecedingNewLineCharacters
Return substring preceding '\r' and/or '\n' characters.

{% collapse title="> Params"%}
| *@param* | type | required | description |
| --- |: --- :|: --- :| --- |
| incomingString | string | true | e.g., 'Web & Mobile Application Developer\r\n'  |
{% endcollapse %}
#####ReturnTerseEmailAddressFromFriendly
Return the actual address portion from a friendly-formatted
address. E.g., return 'noreply@mos.org'.

{% collapse title="> Params"%}
| *@param* | type | required | description |
| --- |: --- :|: --- :| --- |
| incomingString | string | true | e.g., 'The Hub <noreply@mos.org>'  |
{% endcollapse %}

&nbsp;


&nbsp;

[Return to Index](#index)
&nbsp;

&nbsp;

&nbsp;

---
&nbsp;

&nbsp;

