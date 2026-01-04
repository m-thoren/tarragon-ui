import { LOG_TYPES, MsgColor, poshLog } from '../utils/logger'
import { execSync } from 'child_process'

try {
	poshLog('🚀 Starting some pre-push checks 👇', MsgColor.BrightMagenta)

	poshLog('🦄 Checking if libraries build...', MsgColor.BrightCyan)
	execSync('pnpm --r build', { stdio: 'inherit' })
	poshLog('🏰 Build completed successfully!', MsgColor.Green)

	// poshLog('🤖 Running Unit Tests...', MsgColor.BrightCyan)
	// execSync('pnpm run test:all', { stdio: 'inherit' })
	// poshLog('🏆 Tests ran successfully!', MsgColor.Green)

	// poshLog('🤖 Running E2E Tests...', MsgColor.BrightCyan)
	// execSync('pnpm -r e2e', { stdio: 'inherit' })
	// poshLog('🏆 E2E Tests ran successfully!', MsgColor.Green)

	poshLog('🕵️ Running TypeScript type check...', MsgColor.BrightCyan)
	execSync('pnpm --r type-check', { stdio: 'inherit' })
	poshLog('🎈 TypeScript type check passed!', MsgColor.Green)
} catch (error) {
	const errorMessage = `🚨 Pre-push hook failed: ${error instanceof Error ? error.message : 'Unknown error'}`
	poshLog(errorMessage, MsgColor.Red, { logType: LOG_TYPES.Error })
	process.exit(1)
}
