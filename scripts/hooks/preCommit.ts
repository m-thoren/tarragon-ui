import { LOG_TYPES, MsgColor, poshLog } from '../utils/logger'
import { execSync } from 'child_process'

try {
	poshLog('👾 Starting some pre-commit stuffs 👇', MsgColor.BrightMagenta)

	poshLog('🧙 Doing some lint-staged shenanigans...', MsgColor.BrightCyan)
	execSync('npx lint-staged --config lint-staged.config.mts', { stdio: 'inherit' })
	poshLog('🍰 Linting is done!', MsgColor.Green)
} catch (error) {
	const errorMessage = `🚨 Pre-commit hook failed: ${error instanceof Error ? error.message : 'Unknown error'}`
	poshLog(errorMessage, MsgColor.Red, { logType: LOG_TYPES.Error })
	process.exit(1)
}
