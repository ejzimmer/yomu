import type { PronunciationAudio } from '../api/types'
import { SpeakerIcon } from '../icons'
import { IconButton } from './IconButton'

interface Props {
  audios: readonly PronunciationAudio[]
  voiceActorId: number | null
}

export function PlayAudioButton({ audios, voiceActorId }: Props) {
  const url = pickAudioUrl(audios, voiceActorId)
  if (!url) return null

  return (
    <IconButton className="icon-btn" onClick={() => void new Audio(url).play()} label="Play">
      <SpeakerIcon />
    </IconButton>
  )
}

function pickAudioUrl(audios: readonly PronunciationAudio[], voiceActorId: number | null) {
  const preferred = audios.filter((audio) => audio.metadata.voice_actor_id === voiceActorId)
  const choices = preferred.length > 0 ? preferred : audios
  return (choices.find((audio) => audio.content_type === 'audio/mpeg') ?? choices[0])?.url
}
