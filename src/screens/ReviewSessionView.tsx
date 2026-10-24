import { useState } from 'react'
import type { WaniKaniClient } from '../api/client'
import type { SessionItem } from '../quiz/session'
import { getFeedEntry, type FeedEntry } from '../review/getFeedEntry'
import type { ReviewData } from '../review/loadReviewData'
import { queueReview, sendPendingReviews } from '../review/sendReviews'
import { Quiz } from './Quiz'
import { SessionSummary } from './SessionSummary'
import { SrsFeed } from './SrsFeed'

interface Props {
  data: ReviewData
  client: WaniKaniClient
  onExit: () => void
}

export function ReviewSessionView({ data, client, onExit }: Props) {
  const [feed, setFeed] = useState<FeedEntry[]>([])

  function recordReview(item: SessionItem) {
    void queueReview({
      assignmentId: item.assignment.id,
      incorrectMeaningAnswers: item.incorrectMeaningAnswers,
      incorrectReadingAnswers: item.incorrectReadingAnswers,
    }).then(() => sendPendingReviews(client))

    const entry = getFeedEntry(item, data.srsSystems)
    if (entry) setFeed((entries) => [entry, ...entries])
  }

  return (
    <Quiz
      queue={data.queue}
      synonymsBySubject={data.synonymsBySubject}
      aside={
        <SrsFeed entries={feed} onFaded={(id) => setFeed((entries) => entries.filter((entry) => entry.id !== id))} />
      }
      onItemComplete={recordReview}
      renderSummary={(completed, accuracy) => (
        <SessionSummary
          count={completed}
          description={completed === 0 ? 'No reviews due' : `reviewed · ${accuracy}% correct`}
          onExit={onExit}
        />
      )}
      onExit={onExit}
    />
  )
}
