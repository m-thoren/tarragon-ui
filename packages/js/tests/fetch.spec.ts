import { expect, test } from 'vitest'
import { fetchClient } from '../src/fetch'

test('fetchClient is defined', () => {
	expect(fetchClient).toBeDefined()
})
