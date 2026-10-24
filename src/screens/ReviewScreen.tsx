import './ReviewScreen.css'
import { useEffect, useState } from 'react'
import type { WaniKaniClient } from '../api/client'
import { LoadingKanji } from '../components/LoadingKanji'
import { loadReviewData, type ReviewData } from '../review/loadReviewData'
import { ReviewSessionView } from './ReviewSessionView'

interface Props {
  client: WaniKaniClient
  onExit: () => void
}

export function ReviewScreen({ client, onExit }: Props) {
  const [data, setData] = useState<ReviewData | null>(null)

  useEffect(() => {
    void loadReviewData().then(setData)
  }, [])

  if (!data) return <LoadingKanji />
  return <ReviewSessionView data={data} client={client} onExit={onExit} />
}
