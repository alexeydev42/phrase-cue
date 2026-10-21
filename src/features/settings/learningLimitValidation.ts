export const isValidLearningLimit = (limit: number): boolean => {
  return Number.isInteger(limit) && limit >= 1 && limit <= 50
}
