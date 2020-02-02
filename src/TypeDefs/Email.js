/**
 * One email
 * @typedef {object} Email
 * @property {(string|Array} to - email address string or array email 
 * address strings; e.g., ['sp1@mos.org', 'The Hub <sp1@mos.org>']
 * @property {string} from - email address string; must correspond to a 
 * user in the MOS O365 tenancy; e.g., 'sp1@mos.org', 'The Hub <sp1@mos.org>'
 * @property {string} subject - e.g., 'This is a subject'
 * @property {string} [text] - plain text (non-HTML) email body
 * @property {string} [html] - HTML email body
 * @property {string} [system] - flag, archived, indicating system 
 * generating this email; useful for filtering archive; e.g., 'hub'
 * @property {string} [type] - flag, archived, indicating type of 
 * email; useful for filtering archive; e.g., 'notification'
 * @property {string} [event] - flag, archived, indicating type of 
 * email; useful for filtering archive; e.g., 'approved admin'
 */
