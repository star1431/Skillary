import { addCreator, mockCreators, updateCreator, mockPlans } from '@/creatorhub/utils/mockData'

export function listCreators() {
  return mockCreators.slice()
}

export function getCreatorById(id) {
  if (!id) return null
  return mockCreators.find((c) => c.id === id) ?? null
}

export function getCreatorByUserId(userId) {
  if (!userId) return null
  return mockCreators.find((c) => c.userId === userId) ?? null
}

export function createCreatorProfile(payload) {
  return addCreator(payload)
}

export function updateCreatorProfile(creatorId, updates) {
  return updateCreator(creatorId, updates)
}

export function listPlansByCreator(creatorId) {
  if (!creatorId) return []
  return mockPlans.filter((p) => p.creatorId === creatorId)
}

export function getPlanById(planId) {
  if (!planId) return null
  return mockPlans.find((p) => p.id === planId) ?? null
}


