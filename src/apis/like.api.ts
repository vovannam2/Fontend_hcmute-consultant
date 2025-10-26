import { SuccessResponse } from '@/types/utils.type'
import http from '@/utils/http'
import { UserInfo } from '@/types/like.type'

export const likePost = (postId: string) =>
  http.post<SuccessResponse<string>>('like/post', null, {
    params: {
      postId
    }
  })

export const unlikePost = (postId: string) =>
  http.delete<SuccessResponse<string>>('like/unlike/post', {
    params: {
      postId
    }
  })

export const likeComment = (commentId: number) =>
  http.post<SuccessResponse<string>>('like/comment', null, {
    params: {
      commentId
    }
  })

export const likeQuestion = (questionId: string) =>
  http.post<SuccessResponse<string>>(`questions/${questionId}/like`)

export const countLikeOfPost = (postId: string) =>
  http.get<SuccessResponse<number>>('like/like-count/post', {
    params: {
      postId
    }
  })

export const countLikeOfComment = (commentId: number) =>
  http.get<SuccessResponse<number>>('like-count/comment', {
    params: {
      commentId
    }
  })

export const countLikeOfQuestion = (questionId: string) =>
  http.get<SuccessResponse<number>>(`questions/${questionId}/likes/count`)

export const getPostRecord = (postId: string) =>
  http.get<SuccessResponse<{ likeKey: { targetId: string; userId: string; type: string } }[]>>('like/like-records/post', {
    params: {
      postId
    }
  })

export const getCommentRecord = (commentId: number) =>
  http.get<SuccessResponse<{ likeKey: { targetId: number; userId: number; type: string } }[]>>('like/like-records/comment', {
    params: {
      commentId
    }
  })

export const getQuestionRecord = (questionId: string) =>
  http.get<SuccessResponse<{ likeKey: { targetId: string; userId: string; type: string } }[]>>(`questions/${questionId}/like-records`)

export const unLikePost = (postId: string) =>
  http.delete<SuccessResponse<string>>('unlike/post', {
    params: {
      postId
    }
  })

export const unLikeComment = (commentId: number) =>
  http.delete<SuccessResponse<string>>('unlike/comment', {
    params: {
      commentId
    }
  })

export const unLikeQuestion = (questionId: string) =>
  http.delete<SuccessResponse<string>>(`questions/${questionId}/like`)

export const getLikeUsersOfPost = (postId: string) =>
  http.get<SuccessResponse<UserInfo[]>>('like/like-users/post', {
    params: {
      postId
    }
  })

export const getLikeUsersOfComment = (commentId: number) =>
  http.get<SuccessResponse<UserInfo[]>>('like-users/comment', {
    params: {
      commentId
    }
  })

export const getLikeUsersOfQuestion = (questionId: string) =>
  http.get<SuccessResponse<UserInfo[]>>(`questions/${questionId}/like-users`)
