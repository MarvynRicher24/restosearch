// app/services/index.ts
// Barrel file to centralize service exports per domain.
export * from './api'
export * from './restaurants'
export * from './dishes'
export * from './professional'
export * from './users'

import * as api from './api'
import * as restaurants from './restaurants'
import * as dishes from './dishes'
import * as professional from './professional'
import * as users from './users'

// Default export kept for backward compatibility (aggregated)
export default {
	...api,
	...restaurants,
	...dishes,
	...professional,
	...users
}
