// Shapes from the WaniKani API v2 (https://docs.api.wanikani.com), trimmed to what we use.

export interface Resource<T> {
  id: number
  object: string
  url: string
  data_updated_at: string | null
  data: T
}

export interface Collection<T> {
  object: 'collection'
  url: string
  pages: { next_url: string | null; previous_url: string | null; per_page: number }
  total_count: number
  data_updated_at: string | null
  data: Resource<T>[]
}

export interface Preferences {
  default_voice_actor_id: number
  extra_study_autoplay_audio: boolean
  lessons_autoplay_audio: boolean
  lessons_batch_size: number
  lessons_presentation_order: string
  reviews_autoplay_audio: boolean
  reviews_display_srs_indicator: boolean
  reviews_presentation_order: string
}

export interface User {
  username: string
  level: number
  profile_url: string
  started_at: string
  current_vacation_started_at: string | null
  subscription: {
    active: boolean
    type: 'free' | 'recurring' | 'lifetime' | 'unknown'
    max_level_granted: number
    period_ends_at: string | null
  }
  preferences: Preferences
}
