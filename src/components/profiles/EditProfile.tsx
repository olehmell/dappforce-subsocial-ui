import React, { useState } from 'react'
import { Form, Input } from 'antd'
import Router from 'next/router'
import HeadMeta from '../utils/HeadMeta'
import Section from '../utils/Section'
import { stringifyText, getTxParams } from '../substrate'
import { TxFailedCallback, TxCallback } from 'src/components/substrate/SubstrateTxButton'
import { ProfileUpdate, OptionIpfsContent, IpfsContent } from '@subsocial/types/substrate/classes'
import { IpfsCid } from '@subsocial/types/substrate/interfaces'
import { ProfileContent, AnyAccountId, ProfileData } from '@subsocial/types'
import { newLogger } from '@subsocial/utils'
import { useSubsocialApi } from '../utils/SubsocialApiContext'
import { DfForm, DfFormButtons, minLenError, maxLenError } from '../forms'
import DfMdEditor from '../utils/DfMdEditor'
import { withMyProfile } from './address-views/utils/withLoadedOwner'
import { accountUrl } from '../utils/urls'
import { NAME_MIN_LEN, NAME_MAX_LEN, DESC_MAX_LEN, MIN_HANDLE_LEN, MAX_HANDLE_LEN } from 'src/config/ValidationsConfig'
import { UploadAvatar } from '../uploader'

const log = newLogger('EditProfile')

type Content = ProfileContent

type FormValues = Partial<Content>

type FieldName = keyof FormValues

const fieldName = (name: FieldName): FieldName => name

type ValidationProps = {
  minHandleLen: number
  maxHandleLen: number
}

type FormProps = ValidationProps & {
  address: AnyAccountId,
  owner?: ProfileData
}

function getInitialValues ({ owner }: FormProps): FormValues {
  if (owner) {
    const { content } = owner
    return { ...content }
  }
  return {}
}

export function InnerForm (props: FormProps) {
  const [ form ] = Form.useForm()
  const { ipfs } = useSubsocialApi()
  const [ IpfsCid, setIpfsCid ] = useState<IpfsCid>()

  const { owner, address } = props
  const isProfile = owner?.profile
  const initialValues = getInitialValues(props)

  const getFieldValues = (): FormValues => {
    return form.getFieldsValue() as FormValues
  }

  const newTxParams = (cid: IpfsCid) => {
    // const fieldValues = getFieldValues()

    // /** Returns `undefined` if value hasn't been changed. */
    // function getValueIfChanged (field: FieldName): any | undefined {
    //   return form.isFieldTouched(field) ? fieldValues[field] as any : undefined
    // }

    /** Returns `undefined` if CID hasn't been changed. */
    function getCidIfChanged (): IpfsCid | undefined {
      const prevCid = stringifyText(owner?.profile?.content.asIpfs)
      return prevCid !== cid.toString() ? cid : undefined
    }

    if (!isProfile) {
      return [ new IpfsContent(cid) ];
    } else {
      // Update only dirty values.

      // TODO seems like we cannot set a handle to None.

      // TODO uupdate ProfileUpdate class
      const update = new ProfileUpdate({
        content: new OptionIpfsContent(getCidIfChanged())
      })

      return [ update ]
    }
  }

  const fieldValuesToContent = (): Content => {
    return getFieldValues() as Content
  }

  // TODO pin to IPFS only if JSON changed.
  const pinToIpfsAndBuildTxParams = () => getTxParams({
    json: fieldValuesToContent(),
    buildTxParamsCallback: newTxParams,
    setIpfsCid,
    ipfs
  })

  const goToView = () => {
    if (address) {
      Router.push('profile/[address]', accountUrl({ address })).catch(err => log.error('Error while route:', err));
    }
  };

  const onFailed: TxFailedCallback = () => {
    IpfsCid && ipfs.removeContent(IpfsCid).catch(err => new Error(err))
  }

  const onSuccess: TxCallback = () => {
    goToView()
  }

  const onDescChanged = (mdText: string) => {
    form.setFieldsValue({ [fieldName('about')]: mdText })
  }

  const onAvatarChanged = (url?: string) => {
    form.setFieldsValue({ [fieldName('avatar')]: url })
  }

  return <>
    <DfForm form={form} initialValues={initialValues}>
      <Form.Item
        name={fieldName('name')}
        label='Profile name'
        hasFeedback
        rules={[
          { required: true, message: 'Name is required.' },
          { min: NAME_MIN_LEN, message: minLenError('Name', NAME_MIN_LEN) },
          { max: NAME_MAX_LEN, message: maxLenError('Name', NAME_MAX_LEN) }
        ]}
      >
        <Input placeholder='Full name or nickname' />
      </Form.Item>

      <Form.Item
        name={fieldName('avatar')}
        label='Avatar'
      >
        <UploadAvatar onChange={onAvatarChanged} img={initialValues.avatar} />
      </Form.Item>

      <Form.Item
        name={fieldName('about')}
        label='About'
        hasFeedback
        rules={[
          { max: DESC_MAX_LEN, message: maxLenError('Description', DESC_MAX_LEN) }
        ]}
      >
        <DfMdEditor onChange={onDescChanged} />
      </Form.Item>

      <DfFormButtons
        form={form}
        txProps={{
          label: isProfile
            ? 'Update profile'
            : 'Create new profile',
          tx: isProfile
            ? 'profiles.updateProfile'
            : 'profiles.createProfile',
          params: pinToIpfsAndBuildTxParams,
          onSuccess,
          onFailed
        }}
      />
    </DfForm>
  </>
}

// function bnToNum (bn: Codec, _default: number): number {
//   return bn ? (bn as unknown as BN).toNumber() : _default
// }

export function FormInSection (props: FormProps) {
  const [ consts ] = useState<ValidationProps>({
    minHandleLen: MIN_HANDLE_LEN, // bnToNum(api.consts.profiles.minHandleLen, 5),
    maxHandleLen: MAX_HANDLE_LEN // bnToNum(api.consts.profiles.maxHandleLen, 50)
  })

  const { owner } = props
  const title = owner?.profile ? `Edit profile` : `New profile`

  // useSubsocialEffect(() => {
  //   const load = async () => {
  //     // const api = await substrate.api
  //     setConsts({
  //       minHandleLen: MIN_HANDLE_LEN, // bnToNum(api.consts.profiles.minHandleLen, 5),
  //       maxHandleLen: MAX_HANDLE_LEN // bnToNum(api.consts.profiles.maxHandleLen, 50)
  //     })
  //   }
  //   load()
  // }, [])

  return <>
    <HeadMeta title={title} />
    <Section className='EditEntityBox' title={title}>
      <InnerForm {...props} {...consts} />
    </Section>
  </>
}

export const EditProfile = withMyProfile(FormInSection)

export const NewProfile = FormInSection

export default NewProfile
