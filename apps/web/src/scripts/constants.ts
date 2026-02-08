export const siteTitle = 'Tarragon-UI'

export const buildUrl = (path: string) => `${import.meta.env.BASE_URL}${path}`

export type Sections = {
	name: string
	pages: Array<Page>
}

export type Page = {
	name: string
	href: string
	description: string
}

export const sections: Array<Sections> = [
	{
		name: 'Getting started',
		pages: [
			{
				name: 'Installation',
				href: buildUrl('/installation'),
				description: `How to install and set up ${siteTitle} in your project.`,
			},
			{
				name: 'Size',
				href: buildUrl('/size'),
				description: 'Size values and their corresponding CSS units.',
			},
			{
				name: 'Light and Dark Mode',
				href: buildUrl('/light-dark-mode'),
				description: 'Enable light and dark mode for the application.',
			},
			{
				name: 'Theme',
				href: buildUrl('/theme'),
				description: 'Customize the look and feel of the UI components.',
			},
			{
				name: 'View Transitions',
				href: buildUrl('/view-transitions'),
				description:
					'View Transitions is a web API that allows you to create smooth transitions between different views or states of a web application. It provides a way to animate changes in the DOM, such as adding, removing, or rearranging elements, without requiring a full page reload.',
			},
			{
				name: 'Changelog',
				href: buildUrl('/changelog'),
				description:
					'Because the project is still in development, breaking changes may occur often.',
			},
		],
	},
	{
		name: 'Layout',
		pages: [
			{
				name: 'Container',
				href: buildUrl('/container'),
				description:
					'Centers content and sets a maximum width to ensure readability and a consistent layout across different screen sizes.',
			},
			{
				name: 'Flex',
				href: buildUrl('/flex'),
				description:
					'A flexible layout system that allows elements to be arranged in a row or column.',
			},
			{
				name: 'Grid',
				href: buildUrl('/grid'),
				description:
					'A two-dimensional layout system that allows elements to be arranged in rows and columns.',
			},
		].toSorted((a, b) => a.name.localeCompare(b.name)),
	},
	{
		name: 'Typography',
		pages: [
			{
				name: 'Link',
				href: buildUrl('/link'),
				description:
					'An interactive text element that navigates the user to another page or section when clicked. It is fundamental for web navigation and content cross-referencing.',
			},
			{
				name: 'Prose',
				href: buildUrl('/prose'),
				description: 'Applies consistent styling to text content in a container.',
			},
			{
				name: 'Typography',
				href: buildUrl('/typography'),
				description:
					'Defines a consistent set of styles for text elements like headings, paragraphs, and lists. It ensures readable and aesthetically pleasing content throughout the UI.',
			},
		].toSorted((a, b) => a.name.localeCompare(b.name)),
	},
	{
		name: 'Forms',
		pages: [
			{
				name: 'Ajax Form',
				href: buildUrl('/ajax-form'),
				description:
					'A form that submits data asynchronously without requiring a full page reload.',
			},
			{
				name: 'Ajax HTML',
				href: buildUrl('/ajax-html'),
				description:
					'An HTML element that is updated asynchronously without requiring a full page reload.',
			},
			{
				name: 'Button',
				href: buildUrl('/button'),
				description:
					'An interactive element that triggers an action or event when clicked. Available in various styles to fit different contexts and importance levels.',
			},
			{
				name: 'Checkbox',
				href: buildUrl('/checkbox'),
				description:
					'A form control that allows users to select one or more options from a set. It represents a binary state of either checked or unchecked.',
			},
			{
				name: 'Exclusive Checkbox',
				href: buildUrl('/exclusive-checkbox'),
				description:
					'A checkbox that is mutually exclusive with other checkboxes in the same group. When selected, the others are automatically deselected.',
			},
			{
				name: 'Input',
				href: buildUrl('/input'),
				description:
					'A fundamental form control for single-line text input from the user. It supports various types for different data formats like text, number, email, and password.',
			},
			{
				name: 'Radio',
				href: buildUrl('/radio'),
				description:
					'A form control that allows users to select only one option from a mutually exclusive set. Each radio button typically belongs to a group. An option should always be selected by default to prevent an invalid state where no options are chosen.',
			},
			{
				name: 'Search',
				href: buildUrl('/search'),
				description:
					'Provides a dedicated input field for users to query and find specific information within the application or website.',
			},
			{
				name: 'Range',
				href: buildUrl('/range'),
				description:
					'A slider control that lets users select a numerical value from a predefined range. Useful for adjustable settings like volume, zoom, or price filters.',
			},
			{
				name: 'Select All',
				href: buildUrl('/select-all'),
				description:
					'A checkbox that allows users to select or deselect all options in a group with a single click.',
			},
			{
				name: 'Select',
				href: buildUrl('/select'),
				description:
					'A form control that presents a list of options in a dropdown menu, allowing users to choose one or more items. It saves space compared to a full list of choices. Use only as a last resort when the number of options exceeds 5-7 items.',
			},
			{
				name: 'Switch',
				href: buildUrl('/switch'),
				description:
					'A binary toggle control used to switch between two states, such as "on" or "off." Use for settings that require an immediate change in state without needing to submit a form.',
			},
			{
				name: 'Textarea',
				href: buildUrl('/textarea'),
				description:
					'A multiline text input control designed for longer user-entered content, such as comments or descriptions. It allows for more extensive user input than a standard input field.',
			},
			{
				name: 'Validate Form',
				href: buildUrl('/validate-form'),
				description: 'Validate form inputs and display error messages for invalid fields.',
			},
		].toSorted((a, b) => a.name.localeCompare(b.name)),
	},
	{
		name: 'Overlays',
		pages: [
			{
				name: 'Dialog',
				href: buildUrl('/dialog'),
				description:
					'A modal window that appears on top of the main content to request input or display information, requiring user interaction to dismiss. Commonly used for confirmations or critical alerts.',
			},
			{
				name: 'Drawer',
				href: buildUrl('/drawer'),
				description:
					'A modal window that appears on the left side of the screen. Mainly used for mobile navigation',
			},
			{
				name: 'Dropdown',
				href: buildUrl('/dropdown'),
				description:
					'A contextual menu that appears when a user interacts with a button or other control. It can be used for navigation or to display a list of actions.',
			},
			// {
			// 	name: 'Tooltip',
			// 	href: '/tooltip',
			// 	description:
			// 		'A small, interactive popover that provides supplementary information about an element when the user hovers over or focuses on it. It enhances clarity without cluttering the interface.',
			// },
		].toSorted((a, b) => a.name.localeCompare(b.name)),
	},
	{
		name: 'Disclosure',
		pages: [
			{
				name: 'Accordion',
				href: buildUrl('/accordion'),
				description:
					'A vertically stacked list of items that can be expanded or collapsed to reveal content. Ideal for organizing large amounts of information in a compact space.',
			},
			{
				name: 'Breadcrumbs',
				href: buildUrl('/breadcrumbs'),
				description:
					'A navigation aid that indicates the user’s current location within a hierarchical structure. It helps users understand where they are and easily navigate back to previous pages.',
			},
			{
				name: 'Cookie Banner',
				href: buildUrl('/cookie-banner'),
				description:
					'Allow users to accept or reject cookies which are not essential to making your service work.',
			},
			{
				name: 'Pagination',
				href: buildUrl('/pagination'),
				description: 'Controls to jump to specific pages or move sequentially.',
			},
			{
				name: 'Search Filter',
				href: buildUrl('/search-filter'),
				description: '',
			},
			{
				name: 'Steps',
				href: buildUrl('/steps'),
				description:
					'Guides users through a multi-stage process by indicating their current position and overall progress. It helps manage complex workflows or onboarding sequences.',
			},
			{
				name: 'Until Selected',
				href: buildUrl('/until-selected'),
				description:
					'Used to hide and show content controlled by a checkbox, switch or radio.',
			},
		].toSorted((a, b) => a.name.localeCompare(b.name)),
	},
	{
		name: 'Feedback',
		pages: [
			{
				name: 'Alert',
				href: buildUrl('/alert'),
				description:
					'Provides contextual feedback messages for users, typically used to display success, error, warning, or informational notifications.',
			},
			{
				name: 'Progress',
				href: buildUrl('/progress'),
				description:
					'Visual indicators that display the completion status of a task or the passage of time.',
			},
			{
				name: 'Skeleton',
				href: buildUrl('/skeleton'),
				description: 'A placeholder for content that is not loaded yet',
			},
		].toSorted((a, b) => a.name.localeCompare(b.name)),
	},
	{
		name: 'Data Display',
		pages: [
			{
				name: 'Avatar',
				href: buildUrl('/avatar'),
				description:
					'Make an image rounded and give it a 1/1 aspect ratio. Often used for profile images',
			},
			{
				name: 'Badge',
				href: buildUrl('/badge'),
				description:
					'Small, non-interactive visual indicators used to highlight an item, denote a count, or categorize status. Often seen in notifications, labels, or tags.',
			},
			{
				name: 'Figure',
				href: buildUrl('/figure'),
				description: 'Display an image with a caption and source',
			},

			{
				name: 'Table',
				href: buildUrl('/table'),
				description:
					'Organizes and displays data in a structured, tabular format with rows and columns. Ideal for presenting large datasets, comparisons, or summaries.',
			},
		].toSorted((a, b) => a.name.localeCompare(b.name)),
	},
	{
		name: 'Utilities',
		pages: [
			{
				name: 'Aspect Ratio',
				href: buildUrl('/aspect-ratio'),
				description:
					'Maintains a consistent width-to-height ratio for an element, ensuring that it scales proportionally across different screen sizes and devices.',
			},
			{
				name: 'Padding',
				href: buildUrl('/padding'),
				description: 'Utilities for setting spacing around the content within an element.',
			},
			{
				name: 'Gap',
				href: buildUrl('/gap'),
				description:
					'Utilities for setting spacing between items in a flex or grid layout.',
			},
			{
				name: 'Join',
				href: buildUrl('/join'),
				description:
					'A utility for visually connecting adjacent elements, such as buttons or form controls.',
			},
			{
				name: 'Margin',
				href: buildUrl('/margin'),
				description: 'Utilities for setting spacing around elements.',
			},
			{
				name: 'Size Utilities',
				href: buildUrl('/size-utilities'),
				description: 'Utilities for setting width and height of elements.',
			},
			{
				name: 'Typography Utilities',
				href: buildUrl('/typography-utilities'),
				description:
					'Utilities for setting font sizes, weights, and styles for text elements.',
			},
			{
				name: 'Visibility',
				href: buildUrl('/visibility'),
				description:
					'Utilities for controlling the visibility of elements, allowing you to show or hide content based on screen size.',
			},
		].toSorted((a, b) => a.name.localeCompare(b.name)),
	},
]
