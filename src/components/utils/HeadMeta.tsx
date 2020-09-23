import React from 'react';
import Head from 'next/head';
import { isEmptyStr, nonEmptyStr, nonEmptyArr } from '@subsocial/utils';
import { summarize } from './text';
import { resolveIpfsUrl } from 'src/ipfs';

type HeadMetaProps = {
  title: string,
  desc?: string,
  image?: string,
  canonical?: string,
  tags?: string[]
};

// Google typically displays the first 50–60 characters of a title tag.
// If you keep your titles under 60 characters, our research suggests
// that you can expect about 90% of your titles to display properly.
const MAX_TITLE_LEN = 45;
const MAX_DESC_LEN = 300;

const SITE_NAME = 'Subsocial Network';
const DEFAULT_TITLE = 'Subsocial - Protocol for decentralized social networks';
const DEFAULT_DESC = ''; // TODO create default description

export const createTitle = (title: string) => {
  if (isEmptyStr(title)) {
    return DEFAULT_TITLE;
  }

  const leftPart = summarize(title, MAX_TITLE_LEN)
  return `${leftPart} - Subsocial`;
};

const DEFAULT_SUBSOCIAL_IMG = '/subsocial-sign.png'

export function HeadMeta (props: HeadMetaProps) {
  const { title, desc = DEFAULT_DESC, image, canonical, tags } = props;
  const summary = summarize(desc, MAX_DESC_LEN);
  const img = image ? resolveIpfsUrl(image) : DEFAULT_SUBSOCIAL_IMG

  return <div>
    <Head>
      <title>{createTitle(title)}</title>
      {nonEmptyStr(canonical) && <link rel="canonical" href={canonical} />}
      {nonEmptyArr(tags) && <meta name="keywords" content={tags?.join(', ')} />}

      <meta property='og:site_name' content={SITE_NAME} />
      <meta property='og:image' content={img} />
      <meta property='og:title' content={title} />
      <meta property='og:description' content={summary} />

      <meta name='twitter:site' content={SITE_NAME} />
      <meta name='twitter:image' content={img} />
      <meta name='twitter:title' content={title} />
      <meta name='twitter:description' content={summary} />
    </Head>
  </div>;
}

export default HeadMeta;
