# @tarragon-ui/js

Lightweight Web Components that add accessible behavior to standard HTML. The package registers all components when imported; no JavaScript API or framework integration is required.

## Installation

```sh
npm install @tarragon-ui/js
```

Or use pnpm or yarn:

```sh
pnpm add @tarragon-ui/js
yarn add @tarragon-ui/js
```

Import the package once from your application entry point:

```js
import '@tarragon-ui/js'
```

The import registers the `tui-*` custom elements. Use each component's HTML element in your page. Attributes beginning with `data-tui-` configure Tarragon UI components. Unless noted otherwise, a component element receives `data-tui-state="ready"` after successful initialization; the attribute is removed when it disconnects or initialization fails.

The JavaScript package does not add visual styles. Style the documented state attributes and classes in your application CSS. Components that use the HTML Popover API, including `tui-popover` and `tui-dropdown`, require browser support for that API.

## Components

### Ajax Fetch (`tui-ajax-fetch`)

Submits a form as a GET request, then publishes the returned HTML to the shared query cache. Pair it with `tui-ajax-html` to render the result.

```html
<tui-ajax-fetch data-tui-query-key="/search" data-tui-announce-id="search-status">
	<form action="/search" method="GET">
		<label>
			Search
			<input name="q" />
		</label>
		<button type="submit">Search</button>
	</form>
</tui-ajax-fetch>
<div id="search-status" role="status"></div>
<tui-ajax-html
	id="search-results"
	data-tui-url="/search"
	data-tui-query-key="/search"
></tui-ajax-html>
```

Required setup: a descendant `<form>` with an `action`, plus `data-tui-announce-id` pointing to an existing element in the document. `data-tui-query-key` is required for a request to run; it should match the key used by the corresponding `tui-ajax-html` element. The target is assigned `role="status"`. Pending text is announced only if the request takes longer than 500 ms. A response may include `<template data-tui-announce>`; its contents replace the fallback success/error announcement.

| Attribute                     | Optional                              | Behavior                                                                          |
| ----------------------------- | ------------------------------------- | --------------------------------------------------------------------------------- |
| `data-tui-announce-id`        | No                                    | ID of the existing status/announcement element.                                   |
| `data-tui-query-key`          | For initialization; required to fetch | Cache key and request URL.                                                        |
| `data-tui-trigger`            | Yes                                   | `submit` (default) fetches on submit; `change` fetches on input/change.           |
| `data-tui-debounce`           | Yes                                   | Debounce delay in milliseconds for `change` mode; default `300`.                  |
| `data-tui-update-url`         | Yes                                   | Set to `true` to replace the current URL's query string after a successful fetch. |
| `data-tui-message-submitting` | Yes                                   | Pending announcement after 500 ms; default `Fetching...`.                          |
| `data-tui-message-success`    | Yes                                   | Default success announcement; default `Data fetched successfully`.                |
| `data-tui-message-error`      | Yes                                   | Error announcement; default `An error occurred`.                                  |

Package-added styling hooks: the component gets `data-tui-state="ready"`. The announcement element gets `role="status"`. No additional status class or state attribute is added by this component.

### Ajax Form (`tui-ajax-form`)

Submits a form asynchronously using its `action` and `method`. The server response must be HTML. A successful response can update a matching `tui-ajax-html` component through the shared query cache and can include response-specific announcement content.

```html
<tui-ajax-form data-tui-announce-id="form-status" data-tui-query-key="/items">
	<form action="/items" method="POST">
		<label>
			Name
			<input name="name" required />
		</label>
		<button type="submit">Save</button>
	</form>
	<div id="form-status" role="status"></div>
</tui-ajax-form>
```

Required setup: a descendant `<form>`, and `data-tui-announce-id` pointing to an existing element in the document. The target is assigned `role="status"`. Pending text is announced only if the request takes longer than 500 ms. A response may include `<template data-tui-announce>`; its contents replace the fallback success/error announcement. Without a response template, the configured `data-tui-message-success` or `data-tui-message-error` text is used.

For server-side validation, nest `tui-validate-form` inside `tui-ajax-form`. Return a `422` HTML response containing a `form[data-tui-validation-form]`, a summary template, and the invalid controls with `aria-invalid="true"`. Put each field error in an element marked `data-tui-validation-message`, and include its ID in that control's `aria-describedby` value. Controls are matched by `id`, or by name and type when no ID matches. The component patches validation attributes and message content on the existing controls instead of replacing the form, preserving entered values and the active `tui-validate-form` listeners. It announces the summary and focuses the first invalid control. File controls are not patched.

```html
<tui-ajax-form data-tui-announce-id="profile-status">
	<tui-validate-form>
		<form action="/profile" method="POST">
			<label for="profile-email">Email</label>
			<input
				id="profile-email"
				name="email"
				type="email"
				required
				aria-describedby="profile-email-help"
			/>
			<p id="profile-email-help">Use an address you can access.</p>
			<button type="submit">Save profile</button>
		</form>
	</tui-validate-form>
	<div id="profile-status" role="status"></div>
</tui-ajax-form>
```

Example `422` response for that form:

```html
<template data-tui-announce>
	<p>There is 1 error. Review the highlighted field.</p>
</template>
<form data-tui-validation-form>
	<label for="profile-email">Email</label>
	<input
		id="profile-email"
		name="email"
		type="email"
		aria-invalid="true"
		aria-describedby="profile-email-help profile-email-error"
	/>
	<p id="profile-email-help">Use an address you can access.</p>
	<p id="profile-email-error" data-tui-validation-message>
		This email address is already in use.
	</p>
</form>
```

| Attribute                     | Optional | Behavior                                                               |
| ----------------------------- | -------- | ---------------------------------------------------------------------- |
| `data-tui-announce-id`        | No       | ID of the existing status/announcement element.                        |
| `data-tui-query-key`          | Yes      | Cache key to update for HTML responses or invalidate after success.    |
| `data-tui-keep-fields`        | Yes      | Presence keeps form fields from resetting after a successful response. |
| `data-tui-action-on-success`  | Yes      | `remove-form` removes the custom element after success.                |
| `data-tui-message-submitting` | Yes      | Pending announcement after 500 ms; default `Submitting...`.             |
| `data-tui-message-success`    | Yes      | Default success announcement; default `Data submitted successfully`.   |
| `data-tui-message-error`      | Yes      | Error announcement; default `An error occurred`.                       |

Package-added behavior: while submitting, the component gets `data-tui-is-submitting` and appends a `.loading` element containing `.spinner`. The announcement target receives `role="status"`; the component does not assign announcement classes. After a successful response it emits the bubbling `tui:ajax-form:form` event.

### Ajax HTML (`tui-ajax-html`)

Renders HTML from a shared query-cache entry, optionally refreshing it according to a load strategy. The response can contain an element with the same `id` as this component, in which case only that element's contents are rendered; otherwise the response body is rendered.

```html
<tui-ajax-html
	id="results"
	data-tui-url="/results"
	data-tui-query-key="/results"
	data-tui-load-strategy="lazy"
></tui-ajax-html>
```

Required attributes: a non-empty `id`, `data-tui-url`, and `data-tui-query-key`. The component uses `data-tui-query-key` as the query-cache key and, when it fetches, that key is also the request URL.

| Attribute                | Optional | Behavior                                                                                                                                                                             |
| ------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `id`                     | No       | Selects the matching element from returned HTML.                                                                                                                                     |
| `data-tui-query-key`     | No       | Query-cache key and request URL. Keep it consistent with related Ajax Fetch/Form components.                                                                                         |
| `data-tui-url`           | Yes       | Required when using a load strategy other than 'server-side'.                                                                                                                               |
| `data-tui-load-strategy` | Yes      | `initial` fetches immediately; `lazy` fetches near viewport; `defer` fetches at `DOMContentLoaded`; `server-side` waits for cache data. With no value, it also waits for cache data. |

Package-added styling hooks: the component gets `data-tui-state="ready"`. After rendering new content, it emits the bubbling `tui:ajax-html:render` event.

### Boop (`tui-boop`)

Adds a short hover animation class to a bound element, unless the user prefers reduced motion. Supply the animation styling yourself.

```html
<button>
	Save
	<tui-boop></tui-boop>
</button>
```

Required attributes: none. By default, the boop binds to the closest focusable ancestor, or its parent element if none is found. `data-tui-bind-element` optionally accepts a CSS selector for the element to bind to.

Package-added styling hooks: `boop-active` is added to the `tui-boop` element on mouse enter and removed after 150 ms. The component itself gets `data-tui-state="ready"`.

### Dropdown (`tui-dropdown`)

Adds keyboard navigation and item selection behavior to a native popover dropdown.

```html
<tui-dropdown>
	<button type="button" popovertarget="actions">Actions</button>
	<div id="actions" popover>
		<button type="button">Edit</button>
		<a href="/delete">Delete</a>
	</div>
</tui-dropdown>
```

Required setup: a descendant element with the `popover` attribute and an `id`, plus a descendant `<button>` whose `popovertarget` matches that ID. There are no `data-tui-*` configuration attributes.

Package-added styling hooks: the popover element gets `data-tui-state="open"` or `data-tui-state="closed"`. The `tui-dropdown` host also gets the shared `data-tui-state="ready"` hook.

### Exclusive Checkbox (`tui-exclusive-checkbox`)

Makes one checkbox mutually exclusive with a named set of sibling checkboxes. Checking the exclusive checkbox clears enabled matching checkboxes; checking any matching checkbox clears the exclusive checkbox.

```html
<div>
	<tui-exclusive-checkbox data-tui-target-name="item">
		<label>
			<input type="checkbox" />
			None
		</label>
	</tui-exclusive-checkbox>
	<label>
		<input type="checkbox" name="item" />
		First
	</label>
	<label>
		<input type="checkbox" name="item" />
		Second
	</label>
</div>
```

Required setup: `data-tui-target-name`, a descendant `<input>` checkbox, a parent element, and at least one checkbox with the matching `name` inside that parent.

Package-added styling hooks: no component-specific styling attributes or classes are added. The host gets the shared `data-tui-state="ready"` hook. A change emits the bubbling `tui:exclusive-checkbox:toggle` event.

### Popover (`tui-popover`)

Adds state tracking and dismissal behavior to a native HTML popover.

```html
<tui-popover>
	<button type="button" popovertarget="help">Help</button>
	<div id="help" popover="manual">Help content</div>
</tui-popover>
```

Required setup: a descendant `<div popover>` with an `id`, and a descendant `<button>` whose `popovertarget` matches the popover ID. Use `popover="manual"` for Escape-key dismissal and focus restoration behavior.

Package-added styling hooks: the popover gets `data-tui-state="open"` or `data-tui-state="closed"`; the host gets the shared `data-tui-state="ready"` hook.

### Select All (`tui-select-all`)

Synchronizes a select-all checkbox with a named set of sibling checkboxes and maintains the indeterminate state.

```html
<div>
	<tui-select-all data-tui-target-name="item" data-tui-checkbox-class="item-row">
		<label>
			<input type="checkbox" />
			Select all
		</label>
	</tui-select-all>
	<label>
		<input type="checkbox" name="item" />
		First
	</label>
	<label>
		<input type="checkbox" name="item" />
		Second
	</label>
</div>
```

Required setup: `data-tui-target-name`, a descendant `<input>` checkbox, a parent element, and at least one checkbox with the matching `name` inside that parent.

| Attribute                 | Optional | Behavior                                                     |
| ------------------------- | -------- | ------------------------------------------------------------ |
| `data-tui-target-name`    | No       | `name` of the checkboxes to control.                         |
| `data-tui-checkbox-class` | Yes      | Class added to the parent of each enabled matching checkbox. |

Package-added styling hooks: the optional class is applied to each target checkbox's parent. The host gets the shared `data-tui-state="ready"` hook. A change emits the bubbling `tui:select-all:toggle` event.

### Tabs (`tui-tabs`)

Turns a list of links into an accessible tab interface. Each tab link's `href` must point to a panel ID in the document.

```html
<tui-tabs>
	<ul>
		<li><a href="#overview">Overview</a></li>
		<li><a href="#details">Details</a></li>
	</ul>
	<div id="overview">Overview content</div>
	<div id="details" hidden>Details content</div>
</tui-tabs>
```

Required setup: a descendant `<ul>` or `<ol>` containing at least one `<a href="#panel-id">`, and at least one matching panel element in the document. Mark one link `aria-selected="true"` in the markup to choose the initial tab; otherwise the first tab is selected.

Package-added styling hooks: the list and links receive `role="tablist"` and `role="tab"`; list items receive `role="presentation"`. Tabs receive `aria-selected`, `aria-controls`, and `tabindex`; panels receive `role="tabpanel"`, and inactive panels get `hidden`. Panels without focusable descendants also get `tabindex="0"`. Style selected tabs with `[aria-selected="true"]`. The host gets the shared `data-tui-state="ready"` hook.

### Until Selected (`tui-until-selected`)

Shows or hides its contents based on the checked state of a checkbox or radio input.

```html
<label>
	<input id="show-details" type="checkbox" />
	Show details
</label>
<tui-until-selected data-tui-target="show-details">
	Details are visible while the checkbox is checked.
</tui-until-selected>
```

Required attribute: `data-tui-target`, the `id` of an existing `<input>` element. If `data-tui-show-when="not-checked"`, content is shown while the input is unchecked; otherwise it is shown while checked.

| Attribute               | Optional | Behavior                                                                                                         |
| ----------------------- | -------- | ---------------------------------------------------------------------------------------------------------------- |
| `data-tui-target`       | No       | ID of the input whose checked state controls visibility.                                                         |
| `data-tui-show-when`    | Yes      | `checked` (default) or `not-checked`.                                                                            |
| `data-tui-focus-target` | Yes      | ID of the element to focus if the content becomes hidden while focus is inside it. Defaults to the target input. |
| `data-tui-events`       | Yes      | Comma-separated additional event names listened for on `document`.                                               |

Package-added styling hooks: the `hidden` attribute is toggled on the component. The host also gets the shared `data-tui-state="ready"` hook.

### Validate Form (`tui-validate-form`)

Adds accessible error reporting to native form validation, including required, pattern, and other HTML constraint validation. It can also validate checkbox/radio groups by requiring at least one checked input.

```html
<tui-validate-form>
	<template data-tui-validation-message-template>
		<p class="form-message"><span data-tui-slot="form-message"></span></p>
	</template>
	<form action="/signup" method="POST">
		<label>
			Email
			<input type="email" name="email" required />
		</label>
		<fieldset data-tui-validate-group>
			<legend>Choose at least one</legend>
			<label>
				<input type="checkbox" name="topics" value="news" />
				News
			</label>
			<label>
				<input type="checkbox" name="topics" value="events" />
				Events
			</label>
		</fieldset>
		<button type="submit">Sign up</button>
	</form>
</tui-validate-form>
```

Required setup: a descendant `<form>`. No `data-tui-*` attribute is required. Add `data-tui-validate-group` to a group that must contain at least one checked input. A message template is optional; without one, generated messages use a `<p class="form-message">` element.

| Attribute                              | Optional | Applies to                        | Behavior                                                                                                |
| -------------------------------------- | -------- | --------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `data-tui-validate-group`              | Yes      | Group inside the form             | Requires at least one checked input. The group can be a `<fieldset>`.                                   |
| `data-tui-validate-message`            | Yes      | Field or group                    | Custom error message.                                                                                   |
| `data-tui-validation-message-template` | Yes      | `<template>` inside the component | Template for generated errors; include a `[data-tui-slot="form-message"]` element for the message text. |
| `data-tui-checkbox-group-message`      | Yes      | Component                         | Default message for invalid checkbox groups; default `Please select at least one option.`               |
| `data-tui-radio-group-message`         | Yes      | Component                         | Default message for invalid radio groups; default `Please select an option.`                            |

Package-added styling hooks: the form gets `novalidate`. Invalid fields/groups get `aria-invalid="true"` and `aria-describedby` pointing to their generated message. Validation groups change from `data-tui-validate-group` to `data-tui-validate-group="interacted"` after interaction. Generated messages use `.form-message` by default, or the class/content supplied by the template. The host gets the shared `data-tui-state="ready"` hook. The bubbling `tui:validate-form:validate` event fires on initialization and around submission validation; its pre-validation occurrence is cancelable.
