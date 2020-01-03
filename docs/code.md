#Code Reference
##Index

* [Repo](https://github.com/HubTester1/HubClient2.1)
* [Agenda](#agenda)
* [Next.js](#nextjs)
{% collapse title="- Components"%}
- [App](#app)
- [Document](#document)
- [Index](#index)
{% endcollapse %}
* [Services](#services)
{% collapse title="- Services"%}
- [App Loader](#app-loader)
- [Screen](#screen)
- [State Store - Make Store](#state-store - make store)
- [State Store - Reducer](#state-store - reducer)
- [State Store - Selectors](#state-store - selectors)
- [Style](#style)
- [User](#user)
- [Utilities](#utilities)
{% endcollapse %}
* [Layout](#layout)
{% collapse title="- Components"%}
- [Container](#container)
- [Grid](#grid)
{% endcollapse %}
* [Screens](#screens)
{% collapse title="- Components"%}
- [Partial Screen Header](#partial-screen header)
- [Screen](#screen)
{% endcollapse %}
* [Partial Screens](#partial screens)
{% collapse title="- Components"%}
- [Partial Screen - Announcements](#partial-screen - announcements)
- [Partial Screen - Classifieds](#partial-screen - classifieds)
- [Partial Screen - Pinned](#partial-screen - pinned)
- [Partial Screen - Today and Recent](#partial-screen - today and recent)
- [Partial Screen Registry](#partial-screen registry)
{% endcollapse %}
* [Assets](#assets)
{% collapse title="- Components"%}
- [Brand - Hub - Logo + Wordmark - Horizontal](#brand-- hub - logo + wordmark - horizontal)
- [Brand - Hub - Logo Only](#brand-- hub - logo only)
- [Icon - Home](#icon-- home)
- [Icon - Messages](#icon-- messages)
- [Icon - On The Hub](#icon-- on the hub)
- [Icon - People](#icon-- people)
- [Icon - Search - Pointed Left](#icon-- search - pointed left)
- [Icon - Search - Pointed Right](#icon-- search - pointed right)
{% endcollapse %}
* [Headers](#headers)
{% collapse title="- Components"%}
- [Primary Nav](#primary-nav)
- [Search - Title - Secondary Nav](#search-- title - secondary nav)
{% endcollapse %}
* [Ingredients](#ingredients)
{% collapse title="- Components"%}
- [Button](#button)
- [Icon](#icon)
- [Icon Registry](#icon-registry)
- [Link Button](#link-button)
- [Plane](#plane)
{% endcollapse %}

##Agenda
Not a system component. Just a todo list culled from @todos in the code.

| *@todo* | path |
| ----------- | ----------- |
| When link has no 'p', screen changes but partial does not | /meta/agenda.js |
| New Link component that updates browser history w/ new params | /meta/agenda.js |
| Serverless research / planning | /meta/agenda.js |
| Lazy load modules | /meta/agenda.js |
| Lazy load components | /meta/agenda.js |
| AMP | /meta/agenda.js |
| Serverless implementation | /meta/agenda.js |
| Move to cloud | /meta/agenda.js |
| Maintenance mode setting and screen | /meta/agenda.js |
| API unavailable message | /meta/agenda.js |
| Get showe and shudson ribbon permission from database - in user service | /src/public/app-loader.js |
| Get jbaker ribbon permission from database - in user service | /src/public/app-loader.js |
| params, types, required or optional | /src/components/Ingredients/Button/Button.js |
| Remove disused sticky header styles | /src/components/Layout/Container.js |
| params, types, required or optional | /src/components/Layout/Grid.js |
| params, types, required or optional | /src/components/Ingredients/LinkButton/LinkButton.js |
| document upon completion | /src/components/Screens/Partials/Messages/Announcements.js |
| document upon completion | /src/components/Screens/Partials/Messages/Classifieds.js |
| params, types, required or optional | /src/components/Screens/Partials/Home/Pinned.js |
| document upon completion | /src/components/Screens/Partials/Home/Pinned.js |
| document upon completion | /src/components/Screens/Partials/Home/TodayAndRecent.js |
| params, types, required or optional | /src/components/Screens/Partials/Common/PartialScreenHeader.js |
| document upon completion | /src/components/Screens/Partials/Common/PartialScreenHeader.js |
| Make into a service? | /src/components/Screens/Partials/Registry.js |
| params, types, required or optional | /src/components/Ingredients/Plane/Plane.js |
| params, types, required or optional | /src/components/Screens/Screen.js |
| Document functions | /src/services/Screen.js |
| Document functions | /src/services/State/Reducer.js |
| Document functions | /src/services/State/Selectors.js |
| Document functions | /src/services/Style.js |
| Refactor into module instead of class | /src/services/User.js |
| Fetch live data | /src/services/User.js |
| Assign roles in cloud | /src/services/User.js |
| Set mosManager as a role in cloud | /src/services/User.js |
| Get showe and shudson ribbon permission from database - in user service | /src/services/User.js |
| Get jbaker ribbon permission from database - in user service | /src/services/User.js |
| Document functions | /src/services/User.js |
| Document functions | /src/services/Utilities.js |

&nbsp;

[Return to Index](#index)
&nbsp;

&nbsp;

&nbsp;

---
&nbsp;

&nbsp;

##Next.js
This is the Next.js preamble.

###App

Connect Next.js to Redux. Create state store. Get data from index page component and send to state store via reducers.

Used by Next.js in transpilation; overrides default Next.js _app.

> /src/pages/_app.js


&nbsp;

###Document

Collect and handle styles from styled-components. Render &lt;html>.

Used by Next.js in transpilation; overrides default Next.js _document.

> /src/pages/_document.js


&nbsp;

###Index

*`@smart`*

Fetch data and send it to _app. Render Container component.

Used by Next.js whenever /index is requested.

> /src/pages/index.js

{% collapse title="> Params"%}
| *@param* | type | required | smart | description |
| --- |: --- :|: --- :|: --- :| --- |
| s | string |  |  | URL param indicating which screen is requested.  |
| p | string |  |  | URL param indicating which partial screen is requested.  |
| u | string |  |  | URL param indicating current user's account name.  E.g., "sp1". SPO sets correct current user, even if the wrong user was entered.  |
| o | string |  |  | URL param indicating an account name that should be used  instead of the current user's account name. If the current user does not have  permission to emulate another user, this param will be ignored.  |
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

##Services
This is the Services preamble.


&nbsp;

[Return to Index](#index)
&nbsp;

&nbsp;

&nbsp;

---
&nbsp;

&nbsp;

##Layout
###Container

*`@smart`*

App root.

Compute and inject global styles. Determine screen size and 
dispatch to state store. Listen for screen resize events and 
re-dispatch screen size to state store. Render App Grid.

> /src/components/Layout/Container.js


&nbsp;

###Grid

Scaffolding for headers and screen contents.

> /src/components/Layout/Grid.js


&nbsp;


&nbsp;

[Return to Index](#index)
&nbsp;

&nbsp;

&nbsp;

---
&nbsp;

&nbsp;

##Screens
###Partial Screen Header

Must document upon completion.

> /src/components/Screens/Partials/Common/PartialScreenHeader.js


&nbsp;

###Screen

*`@smart`*

Main content within app. Corresponds to "s" url param.

> /src/components/Screens/Screen.js


&nbsp;


&nbsp;

[Return to Index](#index)
&nbsp;

&nbsp;

&nbsp;

---
&nbsp;

&nbsp;

##Partial Screens
###Partial Screen - Announcements

*`@smart`*

Must document upon completion.

> /src/components/Screens/Partials/Messages/Announcements.js


&nbsp;

###Partial Screen - Classifieds

*`@smart`*

Must document upon completion.

> /src/components/Screens/Partials/Messages/Classifieds.js


&nbsp;

###Partial Screen - Pinned

*`@smart`*

Must document upon completion.

> /src/components/Screens/Partials/Home/Pinned.js


&nbsp;

###Partial Screen - Today and Recent

*`@smart`*

Must document upon completion.

> /src/components/Screens/Partials/Home/TodayAndRecent.js


&nbsp;

###Partial Screen Registry

Registry (exports) of all partial screen components.
Screen component gets its partial screen content from this registry.

> /src/components/Screens/Partials/Registry.js


&nbsp;


&nbsp;

[Return to Index](#index)
&nbsp;

&nbsp;

&nbsp;

---
&nbsp;

&nbsp;

##Assets
###Brand - Hub - Logo + Wordmark - Horizontal

SVG. Letterforms in Akzidenz Grotesk.

> /src/components/Assets/Brands/BrandHorizontal.js


&nbsp;

###Brand - Hub - Logo Only

SVG.

> /src/components/Assets/Brands/BrandLogoOnly.js


&nbsp;

###Icon - Home

SVG from Microsoft Fabric UI

> /src/components/Assets/Icons/IconHome.js


&nbsp;

###Icon - Messages

SVG from Microsoft Fabric UI

> /src/components/Assets/Icons/IconMessages.js


&nbsp;

###Icon - On The Hub

SVG from Microsoft Fabric UI

> /src/components/Assets/Icons/IconOnTheHub.js


&nbsp;

###Icon - People

SVG from Microsoft Fabric UI

> /src/components/Assets/Icons/IconPeople.js


&nbsp;

###Icon - Search - Pointed Left

SVG from Microsoft Fabric UI

> /src/components/Assets/Icons/IconSearchToLeft.js


&nbsp;

###Icon - Search - Pointed Right

SVG from Microsoft Fabric UI

> /src/components/Assets/Icons/IconSearchToRight.js


&nbsp;


&nbsp;

[Return to Index](#index)
&nbsp;

&nbsp;

&nbsp;

---
&nbsp;

&nbsp;

##Headers
###Primary Nav

*`@smart`*

Primary navigation within app.

> /src/components/Headers/PrimaryNav/PrimaryNav.js


&nbsp;

###Search - Title - Secondary Nav

*`@smart`*

Search box, screen title, partial screen tabs (secondary navigation).

> /src/components/Headers/SearchTitleSecondaryNav/SearchTitleSecondaryNav.js


&nbsp;


&nbsp;

[Return to Index](#index)
&nbsp;

&nbsp;

&nbsp;

---
&nbsp;

&nbsp;

##Ingredients
Items such as controls that appear across other parts of the app.

###Button

*`@smart`*

Button.

> /src/components/Ingredients/Button/Button.js

{% collapse title="> Params"%}
| *@param* | type | required | smart | description |
| --- |: --- :|: --- :|: --- :| --- |
| backgroundColor | string |  |  | Color of background. Style service param.  Reminder: may be transparent. E.g., "bold-pink".  |
| clickHandler | string |  |  | Function executed when button is clicked. E.g., () => handleClick(...params).  |
| contentColor | string |  |  | Color of text and/or icon. Style service param. E.g., "primary-green".  |
| contentHeightInRem | string |  |  | Height of button's text and/or icon, measured in rem. E.g., "3".  |
| elevationLevel | string |  |  | Elevation level. Style service param. E.g., "4".  |
| heightInRem | string | true |  | Height of button, measured in rem. E.g., "5".  |
| marginInRem | string |  |  | Margin size, measured in rem, to be applied to all sides of button. E.g., "2".  |
| screenSize | string |  | true | Current screen size token. E.g., "small".  |
| text | string | true |  | Text content of button. E.g., "Button Text".  |
| textInvisible | boolean |  |  | Indicates that text should be hidden from sight  (but will remain available to assistive technologies). E.g., true.  |
| widthInRem | string | true |  | Width of button, measured in rem. E.g., "15".  |
{% endcollapse %}

&nbsp;

###Icon

*`@smart`*

Icon component. Gets icon content from Icon Registry.

> /src/components/Ingredients/Icon/Icon.js

{% collapse title="> Params"%}
| *@param* | type | required | smart | description |
| --- |: --- :|: --- :|: --- :| --- |
| contentColor | string |  |  | Fill color for SVG. Style service param. E.g., "ux-pink".  |
| contentHeightInRem | string | true |  | Height of icon, measured in rem. E.g., "4".  |
| darkMode | boolean |  | true | Whether user prefers dark mode. E.g., true.  |
| iconContent | string | true |  | Which SVG should be used. E.g., "Home".  |
{% endcollapse %}

&nbsp;

###Icon Registry

Registry (exports) of all icon assets. 
Icon component gets its icon content from this registry.

> /src/components/Ingredients/Icon/Registry.js


&nbsp;

###Link Button

*`@smart`*

Facilitates navigation between screens.

> /src/components/Ingredients/LinkButton/LinkButton.js


&nbsp;

###Plane

*`@smart`*

Every two-dimensional space within app.

> /src/components/Ingredients/Plane/Plane.js


&nbsp;


&nbsp;

[Return to Index](#index)
&nbsp;

&nbsp;

&nbsp;

---
&nbsp;

&nbsp;

