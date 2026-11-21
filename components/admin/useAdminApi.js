'use client'
import axios from 'axios'
import { useCallback, useEffect, useRef } from 'react'
import { useAppContext } from '@/context/AppContext'

// Authenticated calls to the admin API (adds the Clerk token).
// get/post keep the same identity across renders, so pages can safely list them
// as effect dependencies without re-fetching in a loop.
export default function useAdminApi() {
  const { getToken } = useAppContext()
  const tokenRef = useRef(getToken)
  useEffect(() => { tokenRef.current = getToken }, [getToken])

  const headers = async () => ({ Authorization: `Bearer ${await tokenRef.current?.()}` })

  const get = useCallback(async (url) => {
    const { data } = await axios.get(url, { headers: await headers(), validateStatus: () => true })
    return data
  }, [])

  const post = useCallback(async (url, body) => {
    const { data } = await axios.post(url, body, { headers: await headers(), validateStatus: () => true })
    return data
  }, [])

  return { get, post }
}

export const money = (currency, n) =>
  `${currency || '$'}${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
