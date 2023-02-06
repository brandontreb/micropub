
import got from 'got'

import { Error } from './response'

const Auth = {
	validateToken: async (tokenEndpoint, token) => {
		try {
			const { body } = await got(tokenEndpoint, {
				headers: {
					'accept': 'application/json',
					'Authorization': `Bearer ${token}`
				},
				responseType: 'json'
			})
			return body
		} catch (err) {
			console.error(err)
		}
	},
	isValidScope: (scope, requiredScopes) => {
		const validScopes = scope.split(' ')
		// Checks if at least one of the values in `requiredScopes` is in `validScopes`
		return requiredScopes.split(' ').some(sc => validScopes.includes(sc))
	},
	getToken: (headers, body) => {		
		const token = (headers && headers.authorization && headers.authorization.split(' ')[1]) || (body && body['access_token'])
		return token || Error.UNAUTHORIZED
	},
	isAuthorized: async (headers, body) => {
		console.log('HEADERS:', headers)
		console.log('BODY:', JSON.stringify(body))		
		const token = Auth.getToken(headers, body)
		if (!token || token.error) {
			return token || Error.UNAUTHORIZED
		}
		const auth = await Auth.validateToken(process.env.TOKEN_ENDPOINT, token)

		// Strip trailing slash from auth.me if it exists
		let authMe = auth.me.replace(/\/$/, '');
		// Strip trailing slash from process.env.ME if it exists
		let me = process.env.ME.replace(/\/$/, '');
		
		if (!auth || authMe !== me) {
			return Error.FORBIDDEN
		}
		return auth
	}
}

export default Auth
