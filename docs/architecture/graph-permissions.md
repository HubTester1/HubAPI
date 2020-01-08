Microsoft Graph Permissions
===========================

Overview
-----------

Granted permissions of type "Application permissions" (those for daemon, not for user).

Note that some of these are granted for experimental purposes, and may not be permanent. (We must understand what something does before we can know if we have a use case for it.)

Details
-----------

| Group | Permission | Description
|-------|------------|------------
| AdministrativeUnit | Read | Allows the app to read administrative units and administrative unit membership.
| ChannelMessage | Read | Allows the app to read all channel messages in Microsoft Teams.
| Chat | Read and Write | Allows an app to read and write all chat messages in Microsoft Teams.
| Directory | Read | Allows the app to read data in your organization's directory, such as users, groups and apps.
| Files | Read and Write | Allows the app to read, create, update and delete all files in all site collections.
| Group | Read and Write | Allows the app to create groups, read all group properties and memberships, update group properties and memberships, and delete groups. Also allows the app to read and write group calendar and conversations.
| GroupMember | Read | Allows the app to read memberships and basic group properties for all groups.
| Mail | Read and Write | Allows the app to create, read, update, and delete mail in all mailboxes. Does not include permission to send mail.
| Mail | Send | Allows the app to send mail as any user.
| OneNote | Read and Write | Allows the app to read all the OneNote notebooks in your organization.
| Place | Read | Allows the app to read company places (conference rooms and room lists) for calendar events and other applications.
| Sites | Full Control | Allows the app to have full control of all site collections.
| TeamsActivity | Read | Allows the app to read all users' teamwork activity feed.
| TeamsActivity | Send | Allows the app to send new activities to any users' teamwork activity feed.
| UserNotification | Read and Write | Allows the app to send, read, update and delete user’s notifications.
| User | Read | Allows the app to read user profiles.
