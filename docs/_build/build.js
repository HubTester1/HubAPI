/* eslint-disable import/no-extraneous-dependencies */
const jsdocx = require('jsdoc-x');
const fs = require('fs');
const jsonFormat = require('json-format');

const config = { 
	// for jsdocx
	files: [
		'./src/components',
		'./src/pages',
		'./src/public',
		'./src/services',
		'./meta',
	],
	recurse: true,
	sort: 'kind',
	includePattern: '.+\\.js(doc|x)?$',
	excludePattern: '/(^|\\/|\\\\)/gm',

	// for custom build
	projectRoot: 'HubClient2.1',
	rawScanDestination: './docs/_build/rawScan.json',
	orderedSectionsDestination: './docs/_build/orderedSections.json',
	markdownDestination: './docs/code.md',
	orderedCategories: [
		'Agenda',
		'Next.js',
		'Services',
		'Layout',
		'Screens',
		'Partial Screens',
		'Assets',
		'Headers',
		'Ingredients',
	],
	preambles: {
		Code: 'This text goes at the top of this screen.',
		Agenda: 'Not a system component. Just a todo list culled from @todos in the code.',
		'Next.js': 'This is the Next.js preamble.',
		Ingredients: 'Items such as controls that appear across other parts of the app.',
		Services: 'This is the Services preamble.',
	},
};
const ReturnPathRelativeLocation = (pathRaw, filename, projectRoot) => {
	const positionOfFirstCharacterOfRoot = pathRaw.lastIndexOf(projectRoot);
	const lengthOfRoot = projectRoot.length;
	return `${pathRaw.substring(positionOfFirstCharacterOfRoot + lengthOfRoot)}/${filename}`;
};
const ReturnAllComponents = (allItemsRawArray, projectRoot) => {
	const allComponents = [];
	allItemsRawArray.forEach((itemRawValue) => {
		if (itemRawValue.tags) {
			itemRawValue.tags.forEach((tag) => {
				if (tag.title && tag.title.trim() === 'component') {
					let category = '';
					itemRawValue.tags.forEach((tagTwo) => {
						if (tagTwo.title && tagTwo.title.trim() === 'category') {
							category = tagTwo.value.trim();
						}
					});
					let smart = false;
					itemRawValue.tags.forEach((tagThree) => {
						if (tagThree.title && tagThree.title.trim() === 'smart') {
							smart = true;
						}
					});
					const objectToPush = {
						name: itemRawValue.name.trim(),
						category,
						description: itemRawValue.description,
						smart,
						path: ReturnPathRelativeLocation(
							itemRawValue.meta.path,
							itemRawValue.meta.filename,
							projectRoot,
						),
					};
					const params = [];
					// NOTE: Does not yet account for the possibility of smart parameters
					if (itemRawValue.params && itemRawValue.params[0]) {
						itemRawValue.params.forEach((paramRaw) => {
							const paramToPush = {
								name: paramRaw.name,
								description: paramRaw.description,
								parent: itemRawValue.name.trim(),
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
						objectToPush.params = params;
					}
					allComponents.push(objectToPush);
				}
			});
		}
	});
	return allComponents;
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
					};
					allServices.push(objectToPush);
				}
			});
		}
	});
	return allServices;
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

const ReturnParamTypeAndRequirement = (paramValueRaw) => {
	const valueParts = paramValueRaw.split('.');
	return {
		type: valueParts[1].trim(),
		required: !!(valueParts[2] && valueParts[2].trim() === 'isRequired'),
	};
};
const ReturnParamIsSmart = (paramValueRaw) => {
	let isSmart = false;
	if (paramValueRaw.tags) {
		paramValueRaw.tags.forEach((tag) => {
			if (tag.title === 'smart') {
				isSmart = true;
			}
		});
	}
	return isSmart;
};
const ReturnAllParams = (allItemsRawArray) => {
	const allParams = [];
	allItemsRawArray.forEach((itemRawValue) => {
		if (
			itemRawValue.kind && 
			itemRawValue.kind === 'member' && 
			itemRawValue.memberof && 
			itemRawValue.meta && 
			itemRawValue.meta.code &&
			itemRawValue.meta.code.type && 
			itemRawValue.meta.code.type === 'MemberExpression'
		) {				
			const memberOfParts = itemRawValue.memberof.split('.');
			if (
				memberOfParts[1] && 
				memberOfParts[1].trim() === 'propTypes'
			) {
				const paramTypeAndRequirement = ReturnParamTypeAndRequirement(itemRawValue.meta.code.value);
				const paramToPush = {
					name: itemRawValue.meta.code.name.trim(),
					description: itemRawValue.description,
					type: paramTypeAndRequirement.type,
					parent: memberOfParts[0],
				};
				if (paramTypeAndRequirement.required) {
					paramToPush.required = true;
				}
				if (ReturnParamIsSmart(itemRawValue)) {
					paramToPush.smart = true;
				}
				if (itemRawValue.defaultvalue) {
					paramToPush.default = itemRawValue.defaultvalue;
				}
				allParams.push(paramToPush);
			}
		}
	});
	return allParams;
};
const ReturnAllParamDefaults = (allItemsRawArray) => {
	const allDefaults = [];
	allItemsRawArray.forEach((itemRawValue) => {
		if (
			itemRawValue.kind
			&& itemRawValue.kind === 'member'
			&& itemRawValue.memberof
			&& itemRawValue.meta
			&& itemRawValue.meta.code
			&& itemRawValue.meta.code.type
			&& itemRawValue.meta.code.type !== 'Identifier'
		) {
			const memberOfParts = itemRawValue.memberof.split('.');
			if (memberOfParts[1] && memberOfParts[1].trim() === 'defaultProps') {
				allDefaults.push({
					name: itemRawValue.meta.code.name.trim(),
					default: typeof (itemRawValue.meta.code.value) === 'string'
						? itemRawValue.meta.code.value.trim()
						: itemRawValue.meta.code.value,
					parent: memberOfParts[0],
				});
			}
		}
	});
	return allDefaults;
};
const ReturnCopyOfObject = (objectValue) => JSON.parse(JSON.stringify(objectValue));
const ReturnComponentsSections = (allItemsRawArray, projectRoot, preambles) => {
	const buildObject = {};
	const allComponents = ReturnAllComponents(allItemsRawArray, projectRoot);
	const allParams = ReturnAllParams(allItemsRawArray);
	const allParamDefaults = ReturnAllParamDefaults(allItemsRawArray);
	allComponents.forEach((component) => {
		const componentCopy = ReturnCopyOfObject(component);
		if (!buildObject[componentCopy.category]) {
			buildObject[componentCopy.category] = {};
		}
		buildObject[componentCopy.category].title = componentCopy.category;
		if (preambles[componentCopy.category]) {
			buildObject[componentCopy.category].preamble = preambles[componentCopy.category];
		}
		if (!buildObject[componentCopy.category].components) {
			buildObject[componentCopy.category].components = [];
		}
		allParams.forEach((param) => {
			const paramCopy = ReturnCopyOfObject(param);
			// if this param goes with this component
			if (paramCopy.parent === componentCopy.name) {
				if (!componentCopy.default) {
					// look for a default value for this param;
					// 		iterate over all paramDefaults
					allParamDefaults.forEach((paramDefault) => {
						// if this default goes with this param and this component
						if (
							paramDefault.name === paramCopy.name
							&& paramDefault.parent === paramCopy.parent
						) {
							// add the default to the param
							paramCopy.default = paramDefault.default;
						}
					});
				}
				// ensure the component has a params array
				if (!componentCopy.params) {
					componentCopy.params = [];
				}
				// add the param, with or without default, to the component
				componentCopy.params.push(paramCopy);
			}
		});
		// add the component to the category inside build object
		buildObject[componentCopy.category].components.push(componentCopy);
	});


	// const tempBuildArray = [allComponents, allParams, allParamDefaults];
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
			resolve({ error: true });
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

* [Repo](https://github.com/HubTester1/HubClient2.1)
`;
	orderedSections.forEach((section) => {
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
const ReturnMarkedDownComponent = ({
	name,
	description,
	smart,
	path,
	params,
}) => {
	let buildString = `###${name}

`;
	if (smart) {
		buildString += `*\`@smart\`*

`;
	}
	const descriptionParts = description.split('\n\n');
	descriptionParts.forEach((descriptionPart) => {
		buildString += `${descriptionPart}

`;
	});
	buildString += `> ${path}

`;
	if (params) {
		buildString += `{% collapse title="> Params"%}
| *@param* | type | required | smart | description |
| --- |: --- :|: --- :|: --- :| --- |
`;
		params.forEach((param) => {
			const typeToken = param.type !== 'bool' ?
				param.type :
				'boolean';
			const requiredToken = param.required ? 'true' : '';
			const smartToken = param.smart ? 'true' : '';
			let paramDescriptionString = '';
			const paramDescriptionParts = param.description.split('\n');
			paramDescriptionParts.forEach((paramDescriptionPart) => {
				paramDescriptionString += `${paramDescriptionPart} `;
			});

			
			buildString += `| ${param.name} | ${typeToken} | ${requiredToken} | ${smartToken} | ${paramDescriptionString} |
`;
		});
		buildString += `{% endcollapse %}
`;
	}

	buildString += `
&nbsp;

`;
	return buildString;
};
const ReturnMarkedDownComponents = (components) => {
	let buildString = '';
	components.forEach((component) => {
		buildString += ReturnMarkedDownComponent(component);
	});

	return buildString;
};
const ReturnMarkedDownSection = (section) => {
	let buildString = `##${section.title}
`;
	if (section.preamble) {
		buildString += `${section.preamble}

`;
	}
	if (section.todos) {
		buildString += ReturnMarkedDownTodos(section.todos);
	}
	if (section.components) {
		buildString += ReturnMarkedDownComponents(section.components);
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
					const componentsSections = ReturnComponentsSections(
						allItemsRawArray, 
						buildConfig.projectRoot, 
						buildConfig.preambles,
					);
					const servicesSections = ReturnServicesSections(
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
						...componentsSections, 
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
