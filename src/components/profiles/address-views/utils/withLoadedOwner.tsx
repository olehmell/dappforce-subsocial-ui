import React, { useState } from 'react'
import { newLogger } from '@subsocial/utils'
import useSubsocialEffect from 'src/components/api/useSubsocialEffect'
import { ProfileData } from 'src/types'
import { ExtendedAddressProps } from './types'
import { Loading } from '../../../utils'
import { useMyAccount } from 'src/components/auth/MyAccountContext'

const log = newLogger(withLoadedOwner.name)

type Props = ExtendedAddressProps & {
  size?: number
  avatar?: string
  mini?: boolean
};

export function withLoadedOwner<P extends Props> (Component: React.ComponentType<any>) {
  return function (props: P) {
    const { owner: initialOwner, address } = props as Props

    if (initialOwner) return <Component {...props} />

    const [ owner, setOwner ] = useState<ProfileData>()
    const [ loaded, setLoaded ] = useState(true)

    useSubsocialEffect(({ flatApi }) => {
      if (!address) return

      let isMounted = true
      
      const loadContent = async () => {
        setLoaded(false)
        const owner = await flatApi.findProfile(address)
        if (isMounted) {
          setOwner(owner)
          setLoaded(true)
        }
      }

      loadContent().catch(err => log.error(
        'Failed to load profile data:', err))

      return () => { isMounted = false }
    }, [ address?.toString() ])

    return loaded
      ? <Component {...props} owner={owner} />
      : <Loading />
  }
}

export function withMyProfile (Component: React.ComponentType<any>) {
  return function (props: any) {
    const { state: { account, address } } = useMyAccount()
    return address ? <Component owner={account} address={address} {...props} /> : null
  }
}
