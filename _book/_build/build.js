/* eslint-disable import/no-extraneous-dependencies */
const jsdocx = require('jsdoc-x');
const fs = require('fs');
const jsonFormat = require('json-format');

const config = { 
	// for jsdocx
	files: [
		// './src',
		'./meta',
		'./src',
	],
	recurse: true,
	sort: 'kind',
	undocumented: false,
	includePattern: '.+\\.js(doc|x)?$',
	excludePattern: '(node_modules|docs)',
	predicate: (symbol) => {
		if (symbol.name !== 'XXX') {
			return true;
		}
		return false;
	},

	// for custom build
	projectRoot: 'HubAPI',
	rawScanDestination: './docs/_build/rawScan.json',
	orderedSectionsDestination: './docs/_build/orderedSections.json',
	markdownDestination: './docs/code.md',
	orderedCategories: [
		'Agenda',
		'APIs',
		'Layers',
		'Services',
	],
	preambles: {
		APIs: `Each API is essentially a collection of Lambda functions. Each function has access to all layers. 
			Each function receives three params from the AWS Lambda service.
			{% collapse title="> Params"%}
| *@param* | type | required | async | description |
| --- |: --- :|: --- :|: --- :| --- |
| event | object | | | Contains information from the invoker, Amazon API Gateway. [Get details of the event parameter](/misc/paramEvent.html)|
| context | object | | | Contains information about the invocation, function, and execution environment. [Get details of the context parameter](/misc/paramContext.html)|
| callback | function | | | In synchronous functions, call this function to send the response. The callback function takes two arguments: an Error and a response. When you call it, Lambda waits for the event loop to be empty and then returns the response or error to the invoker. The response object must be compatible with JSON.stringify. |
{% endcollapse %}`,
		Layers: 'AWS Lambda Layers contain modules (i.e., code), either MOS or contributed, that is external to but relied upon and accessed by Lambda functions (i.e., dependencies).',
		Services: 'Services are MOS modules that are used in an AWS Lambda Layer. [Learn more about Layers](#layers)',
	},
};
const ReturnPathRelativeLocation = (pathRaw, filename, projectRoot) => {
	const positionOfFirstCharacterOfRoot = pathRaw.lastIndexOf(projectRoot);
	const lengthOfRoot = projectRoot.length;
	let locationToReturn = `${pathRaw.substring(positionOfFirstCharacterOfRoot + lengthOfRoot)}`;
	if (filename) {
		locationToReturn += `/${filename}`;
	}
	return locationToReturn;
};
const ReturnFunctionsForThisServiceOrAPI = (allItemsRawArray, parentPath, projectRoot) => {
	const functions = [];
	allItemsRawArray.forEach((itemRawValue) => {
		if (itemRawValue.kind === 'function') {
			if (
				ReturnPathRelativeLocation(
					itemRawValue.meta.path,
					itemRawValue.meta.filename,
					projectRoot,
				) === parentPath
			) {
				const functionToPush = {
					name: itemRawValue.name.trim(),
					description: itemRawValue.description,
				};
				if (itemRawValue.async) {
					functionToPush.async = true;
				}
				const params = [];
				if (itemRawValue.params && itemRawValue.params[0]) {
					itemRawValue.params.forEach((paramRaw) => {
						const paramToPush = {
							name: paramRaw.name,
							description: paramRaw.description,
							// parent: itemRawValue.name.trim(),
						};
						if (!paramRaw.optional || paramRaw.optional !== true) {
							paramToPush.required = true;
						}
						if (
							paramRaw.type && 
							paramRaw.type.names
						) {
							let typeIndication;
							paramRaw.type.names.forEach((typeNameValue, typeNameIndex) => {
								if (typeNameIndex === 0) {
									typeIndication = typeNameValue;
								} else {
									typeIndication = ` | ${typeNameValue}`;
								}
							});
							if (typeIndication) {
								paramToPush.type = typeIndication;
							}
						}
						params.push(paramToPush);
					});
				}
				if (params[0]) {
					functionToPush.params = params;
				}
				functions.push(functionToPush);
			}
		}
	});
	return functions;
};
const ReturnAllServices = (allItemsRawArray, projectRoot) => {
	const allServices = [];
	allItemsRawArray.forEach((itemRawValue) => {
		if (itemRawValue.tags) {
			itemRawValue.tags.forEach((tag) => {
				if (tag.title && tag.title.trim() === 'service') {
					const objectToPush = {
						name: itemRawValue.name.trim(),
						category: 'Services',
						description: itemRawValue.description,
						path: ReturnPathRelativeLocation(
							itemRawValue.meta.path,
							itemRawValue.meta.filename,
							projectRoot,
						),
						functions: ReturnFunctionsForThisServiceOrAPI(
							allItemsRawArray, 
							ReturnPathRelativeLocation(
								itemRawValue.meta.path,
								itemRawValue.meta.filename,
								projectRoot,
							), 
							projectRoot,
						),
					};
					
					
					allServices.push(objectToPush);
				}
			});
		}
	});
	return allServices;
};
const ReturnAllAPIs = (allItemsRawArray, projectRoot) => {
	const allAPIs = [];
	allItemsRawArray.forEach((itemRawValue) => {
		if (itemRawValue.tags) {
			itemRawValue.tags.forEach((tag) => {
				if (tag.title && tag.title.trim() === 'api') {
					const objectToPush = {
						name: itemRawValue.name.trim(),
						category: 'APIs',
						description: itemRawValue.description,
						path: ReturnPathRelativeLocation(
							itemRawValue.meta.path,
							itemRawValue.meta.filename,
							projectRoot,
						),
						functions: ReturnFunctionsForThisServiceOrAPI(
							allItemsRawArray,
							ReturnPathRelativeLocation(
								itemRawValue.meta.path,
								itemRawValue.meta.filename,
								projectRoot,
							),
							projectRoot,
						),
					};


					allAPIs.push(objectToPush);
				}
			});
		}
	});
	return allAPIs;
};
const ReturnAllToDos = (allItemsRawArray, projectRoot) => {
	const allToDos = [];
	allItemsRawArray.forEach((itemRawValue) => {
		if (itemRawValue.todo) {
			itemRawValue.todo.forEach((todo) => {
				const objectToPush = {
					parent: itemRawValue.name.trim(),
					category: 'Agenda',
					description: todo,
					path: ReturnPathRelativeLocation(
						itemRawValue.meta.path,
						itemRawValue.meta.filename,
						projectRoot,
					),
				};
				allToDos.push(objectToPush);
			});
		}
	});
	return allToDos;
};
const ReturnCopyOfObject = (objectValue) => JSON.parse(JSON.stringify(objectValue));
const ReturnAPISections = (allItemsRawArray, projectRoot, preambles) => {
	const buildObject = {};
	const allAPIs = ReturnAllAPIs(allItemsRawArray, projectRoot);
	allAPIs.forEach((api) => {
		const apiCopy = ReturnCopyOfObject(api);

		if (!buildObject[apiCopy.category]) {
			buildObject[apiCopy.category] = {};
		}
		buildObject[apiCopy.category].title = apiCopy.category;
		if (preambles[apiCopy.category]) {
			buildObject[apiCopy.category].preamble = preambles[apiCopy.category];
		}
		if (!buildObject[apiCopy.category].apis) {
			buildObject[apiCopy.category].apis = [];
		}
		buildObject[apiCopy.category].apis.push(apiCopy);
	});
	return buildObject;
};
const ReturnAllLayers = (allItemsRawArray, projectRoot) => {
	const allLayers = [];
	allItemsRawArray.forEach((itemRawValue) => {
		if (itemRawValue.tags) {
			itemRawValue.tags.forEach((tag) => {
				if (tag.title && tag.title.trim() === 'layer') {
					const objectToPush = {
						name: itemRawValue.name.trim(),
						category: 'Layers',
						description: itemRawValue.description,
						path: ReturnPathRelativeLocation(
							itemRawValue.meta.path,
							null,
							projectRoot,
						),
					};


					allLayers.push(objectToPush);
				}
			});
		}
	});
	return allLayers;
};

const ReturnLayersSections = (allItemsRawArray, projectRoot, preambles) => {
	const buildObject = {};
	const allLayers = ReturnAllLayers(allItemsRawArray, projectRoot);
	allLayers.forEach((layer) => {
		const layerCopy = ReturnCopyOfObject(layer);

		if (!buildObject[layerCopy.category]) {
			buildObject[layerCopy.category] = {};
		}
		buildObject[layerCopy.category].title = layerCopy.category;
		if (preambles[layerCopy.category]) {
			buildObject[layerCopy.category].preamble = preambles[layerCopy.category];
		}
		if (!buildObject[layerCopy.category].services) {
			buildObject[layerCopy.category].services = [];
		}
		buildObject[layerCopy.category].services.push(layerCopy);
	});
	return buildObject;
};
const ReturnServicesSections = (allItemsRawArray, projectRoot, preambles) => {
	const buildObject = {};
	const allServices = ReturnAllServices(allItemsRawArray, projectRoot);
	allServices.forEach((service) => {
		const serviceCopy = ReturnCopyOfObject(service);

		if (!buildObject[serviceCopy.category]) {
			buildObject[serviceCopy.category] = {};
		}
		buildObject[serviceCopy.category].title = serviceCopy.category;
		if (preambles[serviceCopy.category]) {
			buildObject[serviceCopy.category].preamble = preambles[serviceCopy.category];
		}
		if (!buildObject[serviceCopy.category].services) {
			buildObject[serviceCopy.category].services = [];
		}
		buildObject[serviceCopy.category].services.push(serviceCopy);
	});
	return buildObject;
};
const ReturnAgendaSections = (allItemsRawArray, projectRoot, preambles) => {
	const buildObject = {};
	const allToDos = ReturnAllToDos(allItemsRawArray, projectRoot);
	allToDos.forEach((todo) => {
		const todoCopy = ReturnCopyOfObject(todo);
		if (!buildObject[todoCopy.category]) {
			buildObject[todoCopy.category] = {};
			buildObject[todoCopy.category].title = todoCopy.category;
			if (preambles[todoCopy.category]) {
				buildObject[todoCopy.category].preamble = preambles[todoCopy.category];
			}
			buildObject[todoCopy.category].todos = [];
		}
		buildObject[todoCopy.category].todos.push(todoCopy);
	});
	return buildObject;
};
const ReturnAllItems = (parseConfig) => new Promise((resolve, reject) => {
	jsdocx.parse(parseConfig, (error, docs) => {
		if (error) {
			resolve({ error: true, stack: error.stack });
		}
		resolve(docs);
	});
});
const WriteToFile = (destination, data, isJSON) => {
	let dataCopy = ReturnCopyOfObject(data);
	if (isJSON) {
		dataCopy = jsonFormat(dataCopy);
	}
	fs.writeFile(destination, dataCopy, (err) => {
		if (err) throw err;
	});
};
const ReturnIndex = (orderedSections) => {
	let buildString = `##Index

* [Repo](https://github.com/HubTester1/HubAPI)
`;
	orderedSections.forEach((section) => {
		if (section && section.title) {
			const sectionID = section.title.toLowerCase().replace('.', '');
			buildString += `* [${section.title}](#${sectionID})
`;
			const childrenTitle = 
				section.components
					? 'Components'
					: section.services
						? 'Services'
						: null;
			const childrenPropertyID = 
				childrenTitle ? 
					childrenTitle.toLowerCase() : 
					null;
			if (childrenTitle) {
				buildString += `{% collapse title="- ${childrenTitle}"%}
`;
				section[childrenPropertyID].forEach((child) => {
					const childID = child.name.replace(' ', '-').toLowerCase();
					buildString += `- [${child.name}](#${childID})
`;
				});
				
				buildString += `{% endcollapse %}
`;
			}
		}
	});
	buildString += `
`;
	return buildString;
};
const ReturnMarkedDownTodos = (todos) => {
	let buildString = `| *@todo* | path |
| ----------- | ----------- |
`;
	todos.forEach((todo) => {
		buildString += `| ${todo.description} | ${todo.path} |
`;
	});
	return buildString;
};
const ReturnMarkedDownService = ({
	name,
	description,
	async,
	path,
	functions,
}) => {
	let buildString = `###${name}

`;
	if (async) {
		buildString += `*\`@async\`*

`;
	}
	const descriptionParts = description.split('\n\n');
	descriptionParts.forEach((descriptionPart) => {
		buildString += `${descriptionPart}

`;
	});
	buildString += `> ${path}

`;
	if (functions) {
		buildString += `####Functions
`;
		functions.forEach((functionValue) => {
			buildString += `#####${functionValue.name}
`;
			const functionDescriptionParts = functionValue.description.split('\n\n');
			functionDescriptionParts.forEach((descriptionPart) => {
				buildString += `${descriptionPart}

`;
			});
			if (functionValue.params) {
				buildString += `{% collapse title="> Params"%}
| *@param* | type | required | async | description |
| --- |: --- :|: --- :|: --- :| --- |
`;
				functionValue.params.forEach((param) => {
					const typeToken = param.type !== 'bool' ?
						param.type :
						'boolean';
					const requiredToken = param.required ? 'true' : '';
					const asyncToken = param.async ? 'true' : '';
					let paramDescriptionString = '';
					const paramDescriptionParts = param.description.split('\n');
					paramDescriptionParts.forEach((paramDescriptionPart) => {
						paramDescriptionString += `${paramDescriptionPart} `;
					});

					buildString += `| ${param.name} | ${typeToken} | ${requiredToken} | ${asyncToken} | ${paramDescriptionString} |
`;
				});
				buildString += `{% endcollapse %}
`;
			}
		});
	}


	buildString += `
&nbsp;

`;
	return buildString;
};
const ReturnMarkedDownServices = (services) => {
	let buildString = '';
	services.forEach((service) => {
		buildString += ReturnMarkedDownService(service);
	});

	return buildString;
};
const ReturnMarkedDownAPI = ({
	name,
	description,
	// async,
	path,
	functions,
}) => {
	let buildString = `###${name}

`;
	const descriptionParts = description.split('\n\n');
	descriptionParts.forEach((descriptionPart) => {
		buildString += `${descriptionPart}

`;
	});
	buildString += `> ${path}

####Functions

`;
	functions.forEach((functionValue) => {
		buildString += `#####${functionValue.name}
`;
		if (functionValue.async) {
			buildString += `*\`@async\`*

`;
		}
		const functionDescriptionParts = functionValue.description.split('\n\n');
		functionDescriptionParts.forEach((descriptionPart) => {
			buildString += `${descriptionPart}

`;
		});
		if (functionValue.params) {
			buildString += `{% collapse title="> Params"%}
| *@param* | type | required | async | description |
| --- |: --- :|: --- :|: --- :| --- |
`;
			functionValue.params.forEach((param) => {
				const typeToken = param.type !== 'bool' ?
					param.type :
					'boolean';
				const requiredToken = param.required ? 'true' : '';
				const asyncToken = param.async ? 'true' : '';
				let paramDescriptionString = '';
				const paramDescriptionParts = param.description.split('\n');
				paramDescriptionParts.forEach((paramDescriptionPart) => {
					paramDescriptionString += `${paramDescriptionPart} `;
				});

				buildString += `| ${param.name} | ${typeToken} | ${requiredToken} | ${asyncToken} | ${paramDescriptionString} |
`;
			});
			buildString += `{% endcollapse %}
`;
		}
	});

	buildString += `
&nbsp;

`;
	return buildString;
};
const ReturnMarkedDownAPIs = (apis) => {
	let buildString = '';
	apis.forEach((api) => {
		buildString += ReturnMarkedDownAPI(api);
	});

	return buildString;
};
const ReturnMarkedDownSection = (section) => {
	let buildString = '';
	if (section && section.title) {
		buildString += `##${section.title}
`;
		if (section.preamble) {
			buildString += `${section.preamble}
`;
		}
		if (section.todos) {
			buildString += ReturnMarkedDownTodos(section.todos);
		}
		if (section.services) {
			buildString += ReturnMarkedDownServices(section.services);
		}
		if (section.apis) {
			buildString += ReturnMarkedDownAPIs(section.apis);
		}
		buildString += `
&nbsp;

[Return to Index](#index)
&nbsp;

&nbsp;

&nbsp;

---
&nbsp;

&nbsp;

`;
	}
	return buildString;
};
const Build = (buildConfig) => {
	ReturnAllItems(buildConfig)
		.then((result) => {
			if (result) {
				WriteToFile(buildConfig.rawScanDestination, result, true);
				if (!result.error) {
					const allItemsRawArray = result;
					let buildString = `#Code Reference
`;
					const apiSections = ReturnAPISections(
						allItemsRawArray,
						buildConfig.projectRoot,
						buildConfig.preambles,
					);
					const servicesSections = ReturnServicesSections(
						allItemsRawArray,
						buildConfig.projectRoot,
						buildConfig.preambles,
					);
					const layersSections = ReturnLayersSections(
						allItemsRawArray,
						buildConfig.projectRoot,
						buildConfig.preambles,
					);
					const agendaSections = ReturnAgendaSections(
						allItemsRawArray, 
						buildConfig.projectRoot, 
						buildConfig.preambles,
					);
					const combinedSections = { 
						...apiSections,
						...layersSections,
						...servicesSections,
						...agendaSections,
					};
					const orderedSections = [];
					buildConfig.orderedCategories.forEach((categoryValue) => {
						orderedSections.push(combinedSections[categoryValue]);
					});
					buildString += ReturnIndex(orderedSections);
					WriteToFile(buildConfig.orderedSectionsDestination, orderedSections, true);
					orderedSections.forEach((section) => {
						buildString += ReturnMarkedDownSection(section);
					});
					WriteToFile(buildConfig.markdownDestination, buildString);
				}
			}
		});
};

Build(config);
