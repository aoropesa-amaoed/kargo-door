import api from './api'

const QUOTE_SETUP_ENDPOINT = '/api/v2/quote/quotes/setup'

export const getQuoteSetup = async () => {
  const response = await api.get(QUOTE_SETUP_ENDPOINT)
  return response.data?.data || response.data || {}
}

export const getPolicies = async () => {
  const setup = await getQuoteSetup()
  const policies = Array.isArray(setup.policies) ? setup.policies : []

  return policies.map((policy) => ({
    ...policy,
    // Normalize display field so UI can always use `name`
    name: policy.alias || policy.name || '',
  }))
}

export const getPolicyNames = async () => {
  const policies = await getPolicies()
  return policies.map((policy) => policy.name).filter(Boolean)
}