#Code Reference
##Index

* [Repo](https://github.com/HubTester1/HubAPI)
* [Agenda](#agenda)
* [APIs](#apis)
* [Layers](#layers)
{% collapse title="- Services"%}
- [NPM](#npm)
- [Services](#services)
{% endcollapse %}
* [Services](#services)
{% collapse title="- Services"%}
- [DataConnection](#dataconnection)
- [DataQueries](#dataqueries)
{% endcollapse %}

##Agenda
| *@todo* | path |
| ----------- | ----------- |
| Gulp | /meta/agenda.js |
| Documentation build | /meta/agenda.js |
| Unwhitelist 0.0.0.0/0 | /meta/agenda.js |
| review 12 factors | /meta/agenda.js |
| Develop the basic services | /meta/agenda.js |
| BIG PIC - People Data | /meta/agenda.js |
| BIG PIC - Send email through Graph | /meta/agenda.js |
| BIG PIC - Pull data from SPO | /meta/agenda.js |
| BIG PIC - Serve client from AWS through SPO | /meta/agenda.js |

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
| *@param* | type | required | async | description |
| --- |: --- :|: --- :|: --- :| --- |
| event | object | | | Contains information from the invoker, Amazon API Gateway. [Get details of the event parameter](/misc/paramEvent.html)|
| context | object | | | Contains information about the invocation, function, and execution environment. [Get details of the context parameter](/misc/paramContext.html)|
| callback | function | | | In synchronous functions, call this function to send the response. The callback function takes two arguments: an Error and a response. When you call it, Lambda waits for the event loop to be empty and then returns the response or error to the invoker. The response object must be compatible with JSON.stringify. |
{% endcollapse %}
###Kitten

Just a sample / testing API

> /src/Lambdas/-dev--Kittens/index.js

####Functions

#####InsertKitten
*`@async`*

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
###NPM

This AWS Lambda Layer contains third-party Node.js modules from [NPM](https://www.npmjs.com).

> /src/Layers/-dev-NPM


&nbsp;

###Services

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
###DataConnection

Return connection to either dev or prod database in MongoDB Atlas service.

> /src/Services/-dev-DataConnection/index.js

####Functions
#####ReturnDataConnection
Return [monk](https://www.npmjs.com/package/monk) connection to database, using environment variables


&nbsp;

###DataQueries

Using DataConnection service, facilitate queries of databases in MongoDB Atlas service.

> /src/Services/-dev-DataQueries/index.js

####Functions
#####ReturnAllDocsFromCollection
Return all documents from a collection

{% collapse title="> Params"%}
| *@param* | type | required | async | description |
| --- |: --- :|: --- :|: --- :| --- |
| collection | string | true |  | e.g., '_Kittens'  |
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

