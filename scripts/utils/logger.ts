export const LOG_TYPES = {
	Log: 'log',
	Info: 'info',
	Warn: 'warn',
	Error: 'error',
} as const

type LogType = (typeof LOG_TYPES)[keyof typeof LOG_TYPES]

export enum MsgColor {
	Red = '\x1b[31m',
	Green = '\x1b[32m',
	BrightMagenta = '\x1b[95m',
	BrightCyan = '\x1b[96m',
	Reset = '\x1b[0m',
}

type PoshLogOptions = {
	logType?: LogType
	iNeedSpace?: boolean
}

export const poshLog = (message: string, color: MsgColor, options: PoshLogOptions = {}): void => {
	const { logType = LOG_TYPES.Info, iNeedSpace = true } = options

	const preStuff = iNeedSpace ? '\n' : ''
	console[logType](`${color}${preStuff}${message}${preStuff}${MsgColor.Reset}`)
}
