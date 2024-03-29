export const isProblem = (problem: unknown): problem is Problem => {
  if (!problem || typeof problem !== 'object') {
    return false
  }
  const requiredKeys = ['id', 'status', 'title', 'body', 'solution', 'type', 'author', 'uuid']
  if (requiredKeys.some((key) => !Object.hasOwn(problem, key))) {
    return false
  }
  return true
}

export enum ProblemStatus {
  Posted = 'Posted',
  Review = 'Review',
  Endorsed = 'Endorsed',
}

export type Problem = {
  id: string
  uuid: string
  status: ProblemStatus
  title: string
  body: string
  solution: string
  type: string
  author: string
  aiReview: AiReview | null
}

export type AiReview = {
  aiScore: number
  aiReason: string
}

export type AiChipSpecs = {
  bgColor: string
  color: string
  text: string
}

export enum AiScoreClass {
  LowAttempt = 'Low Attempt',
  MedAttempt = 'Med Attempt',
  HighAttempt = 'High Attempt',
}
