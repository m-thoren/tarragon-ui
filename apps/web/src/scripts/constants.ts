export type Page = {
	name: string
	href: string
	description: string
}

export const docPages: Array<Page> = [
	{ name: 'Introduction', href: '/introduction', description: '' },
	{ name: 'Installation', href: '/installation', description: '' },
	{ name: 'Utilities', href: '/utilities', description: '' },
	{ name: 'Contributing', href: '/contributing', description: '' },
	{ name: 'Changelog', href: '/changelog', description: '' },
	{ name: 'Flex', href: '/flex', description: '' },
	{ name: 'Grid', href: '/grid', description: '' },
	{ name: 'Prose', href: '/prose', description: '' },
	{ name: 'Search', href: '/components', description: '' },
]

export const components: Array<Page> = [
	{
		name: 'Accordion',
		href: '/accordion',
		description:
			'A vertically stacked list of items that can be expanded or collapsed to reveal content. Ideal for organizing large amounts of information in a compact space.',
	},
	{
		name: 'Alert',
		href: '/alert',
		description:
			'Provides contextual feedback messages for users, typically used to display success, error, warning, or informational notifications. They can be dismissible or static.',
	},
	{
		name: 'Badge',
		href: '/badge',
		description:
			'Small, non-interactive visual indicators used to highlight an item, denote a count, or categorize status. Often seen in notifications, labels, or tags.',
	},
	{
		name: 'Breadcrumbs',
		href: '/breadcrumbs',
		description:
			'A navigation aid that indicates the user’s current location within a hierarchical structure. It helps users understand where they are and easily navigate back to previous pages.',
	},
	{
		name: 'Button',
		href: '/button',
		description:
			'An interactive element that triggers an action or event when clicked. Available in various styles and sizes to fit different contexts and importance levels.',
	},
	{
		name: 'Checkbox',
		href: '/checkbox',
		description:
			'A form control that allows users to select one or more options from a set. It represents a binary state of either checked or unchecked.',
	},
	{
		name: 'Cookie Banner',
		href: '/cookie-banner',
		description:
			'Allow users to accept or reject cookies which are not essential to making your service work.',
	},
	{
		name: 'Dropdown',
		href: '/dropdown',
		description:
			'A toggleable overlay that displays a list of links or actions when activated. Useful for navigation menus, context menus, or selection lists.',
	},
	{
		name: 'Dialog',
		href: '/dialog',
		description:
			'A modal window that appears on top of the main content to request input or display information, requiring user interaction to dismiss. Commonly used for confirmations or critical alerts.',
	},
	{
		name: 'Drawer',
		href: '/drawer',
		description:
			'A modal window that appears on the left side of the screen. Mainly used for mobile navigation',
	},
	{
		name: 'Figure',
		href: '/figure',
		description: 'Display an image with a caption and source',
	},
	{
		name: 'Forms',
		href: '/forms',
		description:
			'A collection of input elements and controls designed for collecting user data. Provides structure and styling for comprehensive data entry interfaces.',
	},
	{
		name: 'Link',
		href: '/link',
		description:
			'An interactive text element that navigates the user to another page or section when clicked. It is fundamental for web navigation and content cross-referencing.',
	},
	{
		name: 'Pagination',
		href: '/pagination',
		description:
			'Enables navigation through large sets of content by dividing it into separate pages. It provides controls to jump to specific pages or move sequentially.',
	},
	{
		name: 'Progress',
		href: '/progress',
		description:
			'Visual indicators that display the completion status of a task or the passage of time. They can be linear or circular, determinate or indeterminate.',
	},
	{
		name: 'Input',
		href: '/input',
		description:
			'A fundamental form control for single-line text input from the user. It supports various types for different data formats like text, number, email, and password.',
	},
	{
		name: 'Radio',
		href: '/radio',
		description:
			'A form control that allows users to select only one option from a mutually exclusive set. Each radio button typically belongs to a group.',
	},
	{
		name: 'Search',
		href: '/search',
		description:
			'Provides a dedicated input field for users to query and find specific information within the application or website. Often includes an associated search button or icon.',
	},
	{
		name: 'Range',
		href: '/range',
		description:
			'A slider control that lets users select a numerical value from a predefined range. Useful for adjustable settings like volume, zoom, or price filters.',
	},
	{
		name: 'Select',
		href: '/select',
		description:
			'A form control that presents a list of options in a dropdown menu, allowing users to choose one or more items. It saves space compared to a full list of choices.',
	},
	{
		name: 'Steps',
		href: '/steps',
		description:
			'Guides users through a multi-stage process by indicating their current position and overall progress. It helps manage complex workflows or onboarding sequences.',
	},
	{
		name: 'Switch',
		href: '/switch',
		description:
			'A binary toggle control used to switch between two states, such as "on" or "off." It offers a more visually engaging alternative to a simple checkbox.',
	},
	{
		name: 'Table',
		href: '/table',
		description:
			'Organizes and displays data in a structured, tabular format with rows and columns. Ideal for presenting large datasets, comparisons, or summaries.',
	},
	{
		name: 'Textarea',
		href: '/textarea',
		description:
			'A multiline text input control designed for longer user-entered content, such as comments or descriptions. It allows for more extensive user input than a standard input field.',
	},
	{
		name: 'Typography',
		href: '/typography',
		description:
			'Defines a consistent set of styles for text elements like headings, paragraphs, and lists. It ensures readable and aesthetically pleasing content throughout the UI.',
	},
	// {
	// 	name: 'Tooltip',
	// 	href: '/tooltip',
	// 	description:
	// 		'A small, interactive popover that provides supplementary information about an element when the user hovers over or focuses on it. It enhances clarity without cluttering the interface.',
	// },
].toSorted((a, b) => a.name.localeCompare(b.name))
