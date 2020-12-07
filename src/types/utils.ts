import BN from 'bn.js'
import { PostId, /* SpaceId */ } from '@subsocial/types/substrate/interfaces'
import {
  ProfileData as OldProfileData,
  SpaceData as OldSpaceData,
  PostData as OldPostData,
  PostWithSomeDetails as OldPostWithSomeDetails,
  PostWithAllDetails as OldPostWithAllDetails,
  AnyAccountId,
} from '@subsocial/types'
import {
  EntityId,
  ProfileData,
  SpaceData,
  PostData,
  CommentData,
  // SharedPostData,
  PostWithAllDetails,
  PostWithSomeDetails,
} from './dto'
import { flattenPostStruct, flattenProfileStruct, flattenSpaceStruct } from './flatteners'

export type AnyId = EntityId | BN

export function idToBn (id: AnyId): BN {
  return BN.isBN(id) ? id : new BN(id)
}

export function idsToBns (ids: AnyId[]): BN[] {
  return ids.map(idToBn)
}

// export function idToSpaceId (id: AnyId): SpaceId {
//   return idToBn(id) as SpaceId
// }

export function idToPostId (id: AnyId): PostId {
  return idToBn(id) as PostId
}

export function bnToId (bnId: BN): EntityId {
  return bnId.toString()
}

export function bnsToIds (bnIds: BN[]): EntityId[] {
  return bnIds.map(bnToId)
}

// export function asSharedPostData (postData: PostData): SharedPostData {
//   return postData as unknown as SharedPostData
// }

export function asCommentData (postData: PostData): CommentData {
  return postData as unknown as CommentData
}

export function convertToNewProfileData (accountId: AnyAccountId, old: OldProfileData): ProfileData {
  const struct = flattenProfileStruct(accountId, old.struct)
  return { id: struct.id, struct, content: old.content }
}

export function convertToNewProfileDataArray (accountIds: AnyAccountId[], oldArr: OldProfileData[]): ProfileData[] {
  return accountIds.map((accountId, i) => {
    const old = oldArr[i]
    const struct = flattenProfileStruct(accountId, old.struct)
    return { id: struct.id, struct, content: old.content }
  })
}

export function convertToNewSpaceData (old: OldSpaceData): SpaceData {
  const struct = flattenSpaceStruct(old.struct)
  return { id: struct.id, struct, content: old.content }
}

export function convertToNewSpaceDataArray (old: OldSpaceData[]): SpaceData[] {
  return old.map(convertToNewSpaceData)
}

export function convertToNewPostData (old: OldPostData): PostData {
  const struct = flattenPostStruct(old.struct)
  return { id: struct.id, struct, content: old.content }
}

export function convertToNewPostDataArray (old: OldPostData[]): PostData[] {
  return old.map(convertToNewPostData)
}

export function convertToNewPostWithSomeDetailsArray (oldDataArr: OldPostWithSomeDetails[]): PostWithSomeDetails[] {
  return oldDataArr.map(x => {
    const post = convertToNewPostData(x.post)

    return {
      id: post.id,
      post,
      ext: x.ext && convertToNewPostWithSomeDetails(x.ext),
      owner: x.owner && convertToNewProfileData(post.struct.ownerId, x.owner),
      space: x.space && convertToNewSpaceData(x.space),
    }
  })
}

export function convertToNewPostWithAllDetailsArray (oldDataArr: OldPostWithAllDetails[]): PostWithAllDetails[] {
  return convertToNewPostWithSomeDetailsArray(oldDataArr as OldPostWithAllDetails[]) as PostWithAllDetails[]
}

export function convertToNewPostWithSomeDetails (oldData?: OldPostWithSomeDetails): PostWithSomeDetails | undefined {
  return !oldData ? undefined : convertToNewPostWithSomeDetailsArray([ oldData ])[0]
}

export function convertToNewPostWithAllDetails (oldData?: OldPostWithAllDetails): PostWithAllDetails | undefined {
  return !oldData ? undefined : convertToNewPostWithAllDetailsArray([ oldData ])[0]
}

type SpaceOrPostData = PostData | SpaceData

export function isUnlisted (data?: SpaceOrPostData) {
  if (!data) return true

  const { struct, content } = data

  return struct.hidden || !content
}

export function isPublic (data?: SpaceOrPostData) {
  return !isUnlisted(data)
}