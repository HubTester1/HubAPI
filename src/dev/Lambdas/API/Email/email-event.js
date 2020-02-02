// Sample event data
module.exports = {
	body: {
		to: 'sp1@mos.org',
		from: 'The Hub <noreply@mos.org>',
		subject: 'Test Email',
		html: "<div style=\"font-family: 'wf_segoe-ui_normal', 'Segoe UI', 'Segoe WP', Arial, sans-serif; color: #212121; font-size: 15px\"><p>As needed, <a href=\"https://bmos.sharepoint.com/sites/iit-network-access/SitePages/App.aspx?r=1493\">review the request's details</a> and contact <a href=\"mailto:rstaley@mos.org\">Robin Staley</a> and <a href=\"mailto:ccunningham@mos.org\">Christine Cunningham</a>. When the work for this request has been completed, please <a href=\"https://bmos.sharepoint.com/sites/iit-network-access/SitePages/App.aspx?r=1493\">update the request status</a>.</p><p style=\"font-weight: 700\">The Hub</p></div>",
		system: 'hub',
		type: 'Notification',
		event: 'approved admin',
	},
};
