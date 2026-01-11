import { addContent, mockContents, updateContent, categories } from '@/creatorhub/utils/mockData'

export function listCategories() {
  return categories.slice()
}

export function listContents() {
  return mockContents.slice()
}

export function getContentById(id) {
  if (!id) return null
  return mockContents.find((c) => c.id === id) ?? null
}

export function listContentsByCreator(creatorId) {
  if (!creatorId) return []
  return mockContents.filter((c) => c.creatorId === creatorId)
}

export function createContent(payload) {
  return addContent(payload)
}

export function editContent(contentId, updates) {
  return updateContent(contentId, updates)
}


