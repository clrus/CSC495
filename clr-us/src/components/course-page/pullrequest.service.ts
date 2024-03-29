import { PullRequest, isPullRequest } from '@/types'

import { axios } from '../services/axios'

class PullRequestService {
  postPullRequest = (problemUuid: string, body: string, author: string) => {
    return axios
      .post('/PullRequest', {
        problemUuid,
        body,
        author,
      })
      .then()
      .catch((err) => err)
  }

  getPullRequests = (problemUuid: string, setPrs: (prs: PullRequest[] | null) => void) =>
    axios
      .get(`/PullRequest/problem/${problemUuid}`)
      .then((res) => setPrs(res.data.filter(isPullRequest)))
      .catch((err) => err)

  upvote = (prId: string, username: string) =>
    axios
      .post(`/PullRequest/upvote?id=${prId}&username=${username}`)
      .then()
      .catch((err) => err)

  merge = (prId: string) =>
    axios
      .post(`/PullRequest/merge?id=${prId}`)
      .then()
      .catch((err) => err)
}

export const pullRequestService = new PullRequestService()
