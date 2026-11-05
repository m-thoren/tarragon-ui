export class Announcer {
	private element: HTMLDivElement | null
	private pendingMessageTimer: ReturnType<typeof setTimeout> | null = null
	private announcementTimer: ReturnType<typeof setTimeout> | null = null
	private readonly pendingMessageDelay = 500
	private readonly repeatedAnnouncementDelay = 100

	constructor(element: HTMLDivElement) {
		this.element = element
		element.setAttribute('role', 'status')
	}

	clear() {
		this.clearPendingMessageTimer()
		this.clearAnnouncementTimer()
	}

	announceAfterDelay(content: string) {
		this.clearPendingMessageTimer()
		this.pendingMessageTimer = setTimeout(() => {
			this.pendingMessageTimer = null
			this.announce(content)
		}, this.pendingMessageDelay)
	}

	announce(content: string) {
		const element = this.element
		if (!element) return

		this.clear()
		if (element.innerHTML !== content) {
			element.innerHTML = content
			return
		}

		element.innerHTML = ''
		this.announcementTimer = setTimeout(() => {
			if (this.element === element) element.innerHTML = content
			this.announcementTimer = null
		}, this.repeatedAnnouncementDelay)
	}

	cleanup() {
		this.clear()
		this.element = null
	}

	private clearPendingMessageTimer() {
		if (this.pendingMessageTimer === null) return
		clearTimeout(this.pendingMessageTimer)
		this.pendingMessageTimer = null
	}

	private clearAnnouncementTimer() {
		if (this.announcementTimer === null) return
		clearTimeout(this.announcementTimer)
		this.announcementTimer = null
	}
}
