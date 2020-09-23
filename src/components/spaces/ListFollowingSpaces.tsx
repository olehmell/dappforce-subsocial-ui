import { SpaceData } from '@subsocial/types/dto';
import { nonEmptyArr } from '@subsocial/utils';
import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';

import DataList from '../utils/DataList';
import { HeadMeta } from '../utils/HeadMeta';
import { useSidebarCollapsed } from '../utils/SideBarCollapsedContext';
import { getSubsocialApi } from '../utils/SubsocialConnect';
import { spaceIdForUrl, spaceUrl } from '../urls';
import { ViewSpace } from './ViewSpace';
import ButtonLink from '../utils/ButtonLink';
import { PageLink } from 'src/layout/SideMenuItems';
import BaseAvatar from '../utils/DfAvatar';
import { isMyAddress } from '../auth/MyAccountContext';
import { toShortAddress } from '../utils';

type Props = {
  spacesData: SpaceData[]
};

export const ListFollowingSpaces = (props: Props) => {
  const { spacesData } = props;
  const { query: { address: queryAddress } } = useRouter()

  const address = queryAddress as string
  const totalCount = nonEmptyArr(spacesData) ? spacesData.length : 0;

  const title = isMyAddress(address)
    ? `My Subscriptions (${totalCount})`
    : `Subscriptions of ${toShortAddress(address)}` // TODO show title | username | extension name | short addresss

  return (
    <div className='ui huge relaxed middle aligned divided list ProfilePreviews'>
      <DataList
        title={title}
        dataSource={spacesData}
        renderItem={(item, index) => (
          <ViewSpace {...props} key={index} spaceData={item} preview withFollowButton />
        )}
        noDataDesc='You are not subscribed to any space yet'
        noDataExt={<ButtonLink href='/spaces/all' as='/spaces/all'>Explore spaces</ButtonLink>}
      />
    </div>
  );
};


export const ListFollowingSpacesPage: NextPage<Props> = (props) => {
  const { query: { address } } = useRouter()
  return <>
    <HeadMeta title={`Subscriptions of ${address}`} desc={`Spaces that ${address} follows on Subsocial`} />
    <ListFollowingSpaces {...props} />
  </>
}

ListFollowingSpacesPage.getInitialProps = async (props): Promise<Props> => {
  const { query: { address } } = props;
  const subsocial = await getSubsocialApi()
  const { substrate } = subsocial;

  // TODO sort space ids in a about order (don't forget to sort by id.toString())
  const followedSpaceIds = await substrate.spaceIdsFollowedByAccount(address as string)
  const spacesData = await subsocial.findPublicSpaces(followedSpaceIds);

  return {
    spacesData
  };
};

// TODO extract to a separate file:

export const SpaceLink = (props: { item: SpaceData }) => {
  const { item } = props;
  const { pathname, query } = useRouter();
  const { toggle, state: { asDrawer } } = useSidebarCollapsed();

  if (!item) return null;

  const idForUrl = spaceIdForUrl(item.struct)
  const isSelectedSpace = pathname.includes('spaces') &&
    query.spaceId as string === idForUrl

  return (
    <Link
      key={idForUrl}PlusOutlined
      href='/spaces/[spaceId]'
      as={spaceUrl(item.struct)}
    >
      <a className={`DfMenuSpaceLink ${isSelectedSpace ? 'DfSelectedSpace' : ''}`}>
        <ViewSpace
          key={idForUrl}
          spaceData={item}
          miniPreview
          imageSize={28}
          onClick={() => asDrawer && toggle()}
          withFollowButton={false}
        />
      </a>
    </Link>
  )
}

export const buildFollowedItems = (followedSpacesData: SpaceData[]): PageLink[] => followedSpacesData.map(({ struct, content }) => ({
    name: content?.name || '',
    page: [ '/spaces/[spaceId]', spaceUrl(struct) ],
    icon: <span className='SpaceMenuIcon'><BaseAvatar address={struct.owner} avatar={content?.image} size={24} /></span>
  }))

