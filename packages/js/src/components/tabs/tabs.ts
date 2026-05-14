import { Component, NativeEvent, focusableElementsSelector, tuiAttribute } from '../../constants'
import { ready } from '../../ready'

customElements.define(
	Component.Tabs.Name,
	class extends HTMLElement {
		private tabs: Array<HTMLAnchorElement> = []
		private tabList: HTMLUListElement | null = null
		private tabPanels: Array<HTMLDivElement> = []

		connectedCallback() {
			this.tabList = this.querySelector<HTMLUListElement>('.tablist')
			this.tabs = Array.from(this.querySelectorAll('.tablist a'))

			this.tabPanels = this.tabs
				.map((x) => {
					const href = x.getAttribute('href')
					if (href == null) return
					return document.querySelector(href)
				})
				.filter((x) => x != null) as Array<HTMLDivElement>

			if (!this.tabList || this.tabs.length === 0 || this.tabPanels.length === 0) {
				console.error(`Tabs component: Missing some of elements .tablist, .tabpanel`, this)
				return
			}

			ready(this)
			this.setTabListAttributes()
			this.setTabsAttributes()
			this.setPanelsAttributes()
			this.setEventListeners()
		}

		disconnectedCallback() {
			for (const tab of this.tabs) {
				tab.removeEventListener(NativeEvent.Click, this.handleTabClick)
				tab.removeEventListener(NativeEvent.KeyDown, this.onKeyDown)
			}
		}

		private setEventListeners(): void {
			for (const tab of this.tabs) {
				tab.addEventListener(NativeEvent.Click, this.handleTabClick)
				tab.addEventListener(NativeEvent.KeyDown, this.onKeyDown)
			}
		}

		private setTabListAttributes(): void {
			if (!this.tabList) return

			this.tabList.setAttribute('role', 'tablist')

			const liElements = this.tabList.querySelectorAll<HTMLLIElement>('li')
			liElements.forEach((li) => {
				li.setAttribute('role', 'presentation')
			})
		}

		private setTabsAttributes(): void {
			const startIndex = parseInt(this.getAttribute(tuiAttribute('start-index')) ?? '0')

			this.tabs.forEach((tab, index) => {
				tab.setAttribute('role', 'tab')
				if (index === startIndex) {
					tab.setAttribute('aria-selected', 'true')
				} else {
					tab.setAttribute('aria-selected', 'false')
					tab.setAttribute('tabindex', '-1')
					this.tabPanels[index]?.setAttribute('hidden', '')
				}

				if (this.tabPanels[index]) {
					tab.setAttribute('aria-controls', this.tabPanels[index].id)
				}
			})
		}

		private setPanelsAttributes(): void {
			this.tabPanels.forEach((panel) => {
				panel.setAttribute('role', 'tabpanel')
				const focusableElement = panel.querySelector(focusableElementsSelector)
				if (!focusableElement) {
					panel.setAttribute('tabindex', '0')
				}
			})
		}

		private handleTabClick = (event: Event) => {
			event.preventDefault()
			const clickedTab = event.target as HTMLAnchorElement
			this.changeTab(clickedTab)
		}

		private changeTab(newTab: HTMLAnchorElement): void {
			const activePanelId = newTab.getAttribute('href')?.substring(1)
			const activePanel = this.tabPanels.find((panel) => panel.id == activePanelId)

			this.tabs.forEach((tab) => {
				tab.setAttribute('aria-selected', 'false')
				tab.setAttribute('tabindex', '-1')
			})

			if (activePanel) {
				this.tabPanels.forEach((panel) => {
					panel.setAttribute('hidden', '')
				})

				activePanel.removeAttribute('hidden')
			}

			newTab.setAttribute('aria-selected', 'true')
			newTab.setAttribute('tabindex', '0')
			newTab.focus()
		}

		private moveTab(direction: 1 | -1): void {
			const enabledTabs = this.tabs.filter(
				(tab) => tab.getAttribute('aria-disabled') !== 'true',
			)
			if (enabledTabs.length === 0) return

			const activeIndex = enabledTabs.indexOf(document.activeElement as HTMLAnchorElement)
			if (activeIndex === -1) return

			const index = (activeIndex + direction + enabledTabs.length) % enabledTabs.length
			const nextTab = enabledTabs[index]
			if (!nextTab) return

			this.changeTab(nextTab)
		}

		private onKeyDown = (event: KeyboardEvent) => {
			if ('ArrowLeft' === event.key) {
				this.moveTab(-1)
				return
			}

			if ('ArrowRight' === event.key) {
				this.moveTab(1)
				return
			}

			if ('Home' === event.key) {
				event.preventDefault()

				const firstEnabled = this.tabs.find(
					(tab) => tab.getAttribute('aria-disabled') !== 'true',
				)
				if (firstEnabled) this.changeTab(firstEnabled)
				return
			}

			if ('End' === event.key) {
				event.preventDefault()

				const lastEnabled = [...this.tabs]
					.reverse()
					.find((tab) => tab.getAttribute('aria-disabled') !== 'true')
				if (lastEnabled) this.changeTab(lastEnabled)
				return
			}
		}
	},
)
