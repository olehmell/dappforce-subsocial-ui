import React, { useState } from 'react';
import useSubsocialEffect from 'src/components/api/useSubsocialEffect';
import { nonEmptyStr, newLogger } from '@subsocial/utils';
import { OptionText, OptionId, IpfsContent } from '@subsocial/types/substrate/classes'
import { SubmittableExtrinsic } from '@polkadot/api/promise/types';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { PageContent } from 'src/components/main/PageWrapper';
import { DragDrop } from './Dragger';
import { Loading } from '../utils'
import Section from '../utils/Section';

const log = newLogger('ImportSpaces')

const TxButton = dynamic(() => import('../utils/TxButton'), { ssr: false });

const readJsonFile = (file: File | Blob): Promise<SpaceJsonItem[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onabort = () => reject(new Error('file reading was aborted'))
    reader.onerror = () => reject(new Error('file reading has failed'))
    reader.onload = () => {
    // Do whatever you want with the file contents
      try {
        const json = reader.result
        const res = json ? JSON.parse(json.toString()) : undefined
        resolve(res)
      } catch (err) {
        reject(err)
      }

    }
    reader.readAsText(file)
  })
}

type SpaceJsonItem = {
  'Name': string,
  'Website': string
  'Twitter': string,
  'Medium': string,
  'Github': string,
  'Telegram': string,
  'Email': string,
  'Introduction': string,
  'Description': string,
  'Tags': string,
  'IMG': string,
}

export const Import = () => {
  const [ txs, setTxs ] = useState<SubmittableExtrinsic[]>([])
  const [ projects, setProject ] = useState<SpaceJsonItem[]>([])
  const [ loading, setLoading ] = useState(false)
  const noTxs = !txs.length
  const router = useRouter()

  useSubsocialEffect(({ ipfs, substrate: { api } }) => {
    console.log(projects)
    if (!noTxs || !projects.length) return

    const createTxs = async () => {
      if (!loading) setLoading(true)
      const readyApi = await (await api).isReady

      const promiseTxs = projects.map(async ({ Name: name, Tags, Website, Twitter, Medium, Github, Introduction, Description, Email: email, IMG: image }) => {
        const about = nonEmptyStr(Description) ? Description : Introduction
        const links = [ Website, Twitter, Medium, Github ].filter(nonEmptyStr)
        const tags = Tags.split(',').filter(nonEmptyStr)
        const space = { about, links, image, email, name, tags }
        console.log(space)
        const cid = await ipfs.saveSpace(space)

        return readyApi.tx.spaces.createSpace(...[ new OptionId(), new OptionText(), new IpfsContent(cid) ])
      })

      console.log(promiseTxs)
      const newTxs = await Promise.all(promiseTxs)
      setTxs(newTxs)
      setLoading(false)
    }

    createTxs().catch(err => log.error('Failed preparation data for import: %', err))
  }, [ projects.length ])

  return <PageContent>
    <Section title='Import space from json file' >
      <DragDrop
        className='mt-3'
        onChange={async (file) => {
          setLoading(true)
          const res = await readJsonFile(file)
          const newProjects = Array.isArray(res) ? res : [ res ]
          setProject(newProjects)
        }}
        accept='application/json'
      />
      <div className='mt-3 d-flex justify-content-between align-items-center' >
        <TxButton
          type='primary'
          label='Import'
          disabled={noTxs}
          params={[ txs ]}
          tx='utility.batch'
          onFailed={(err) => console.log(err)}
          onSuccess={() => router.push('/', '/')}
        />
        {loading && <Loading label='Preparation of data for a transaction' />}
      </div>
    </Section>
  </PageContent>
}

export default Import
