import React, { useEffect } from 'react';
import { DataSearch } from '@appbaseio/reactivesearch';
import Router from 'next/router';
import { SearchOutlined } from '@ant-design/icons';
import { ElasticFields } from '../../config/ElasticConfig';
import { useResponsiveSize } from '../responsive';

const App = () => {
  let focus = false;
  let input: HTMLInputElement | undefined;

  const { isNotMobile } = useResponsiveSize()

  useEffect(() => {
    if (!input) return;

    input.focus();
    focus = true;
  }, [ focus ]);

  return (
    <div className='DfSearch'>
      <DataSearch
        componentId='q'
        dataField={[
          ElasticFields.space.name,
          ElasticFields.space.handle,
          ElasticFields.space.about,
          ElasticFields.space.tags,
          ElasticFields.post.title,
          ElasticFields.post.body,
          ElasticFields.post.tags,
          ElasticFields.comment.body,
          ElasticFields.profile.name,
          ElasticFields.profile.about
        ]}
        fieldWeights={[ 3, 2, 1, 2, 3, 1, 2, 2, 3, 1 ]}
        URLParams
        autoFocus
        ref={(c: any) => {
          if (focus || isNotMobile) return;
          input = c._inputRef;
        }}
        onValueSelected={(value) => Router.push('/search', `/search?q="${value}"`)}
        placeholder='Search for spaces, posts or comments'
        iconPosition='left'
        icon={<SearchOutlined style={{ position: 'relative', top: '-0.9rem' }} />}
      />
    </div>
  );
};

export default App;
