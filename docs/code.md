#Code Reference
##Index

* [Repo](https://github.com/HubTester1/HubAPI)
* [Agenda](#agenda)
* [APIs](#apis)
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
This text goes at the top of APIs.
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

##Services
This is the Services preamble.
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

