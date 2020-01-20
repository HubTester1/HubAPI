/**
 * @name Utilities
 * @service
 * @description Miscellaneous utility functions
 */

module.exports.ReturnAccountFromUserAndDomain = (userAndDomain) => userAndDomain.substring(0, userAndDomain.search('@'));
module.exports.ReturnCopyOfObject = (object) => JSON.parse(JSON.stringify(object));
