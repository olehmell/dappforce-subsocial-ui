import React, { useState } from 'react';
import BN from 'bn.js';
import { Loading } from '../../utils';
import useSubsocialEffect from 'src/components/api/useSubsocialEffect';
import { PostWithAllDetails } from '@subsocial/types';
import PostPreview from './PostPreview';
import DataList from 'src/components/utils/DataList';

type OuterProps = {
  postIds: BN[]
}

type ResolvedProps = {
  posts: PostWithAllDetails[]
}

export function withLoadPostsWithSpaces<P extends OuterProps> (Component: React.ComponentType<ResolvedProps>) {
  return function (props: P) {
    const { postIds } = props
    const [ posts, setPosts ] = useState<PostWithAllDetails[]>()
    const [ loaded, setLoaded ] = useState(false)

    useSubsocialEffect(({ subsocial }) => {
      setLoaded(false)

      const loadData = async () => {
        const extPostData = await subsocial.findPublicPostsWithAllDetails(postIds)
        extPostData && setPosts(extPostData)
        setLoaded(true)
      };

      loadData().catch(console.log)
    }, [ false ])

    return loaded && posts
      ? <Component posts={posts} />
      : <Loading />
  }
}

const InnerPostPreviewList: React.FunctionComponent<ResolvedProps> = ({ posts }) =>
  <DataList dataSource={posts} paginationOff renderItem={x => <PostPreview key={x.post.struct.id.toString()} postDetails={x} withActions />} />

export const PostPreviewList = withLoadPostsWithSpaces(InnerPostPreviewList)
