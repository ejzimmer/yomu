import type { ReactNode } from 'react'
import type { ContextSentence, Reading, Resource, Subject } from '../api/types'
import { Mnemonic } from '../components/Mnemonic'
import { PlayAudioButton } from '../components/PlayAudioButton'

interface Props {
  subject: Subject
  subjectsById: ReadonlyMap<number, Resource<Subject>>
  voiceActorId: number | null
}

const READING_TYPES = [
  { type: 'onyomi', name: 'On’yomi' },
  { type: 'kunyomi', name: 'Kun’yomi' },
  { type: 'nanori', name: 'Nanori' },
  { type: undefined, name: 'Readings' },
] as const

export function LessonPage({ subject, subjectsById, voiceActorId }: Props) {
  const components = (subject.component_subject_ids ?? []).flatMap((id) => subjectsById.get(id) ?? [])

  return (
    <article className="lesson-page">
      <div className="lesson-item">
        <span className="characters" lang="ja">
          {subject.characters ?? subject.slug}
        </span>
        <PlayAudioButton audios={subject.pronunciation_audios ?? []} voiceActorId={voiceActorId} />
      </div>

      <LessonSection title="Meaning">
        <MeaningList subject={subject} />
        <Mnemonic text={subject.meaning_mnemonic} />
        {subject.meaning_hint && <Mnemonic text={subject.meaning_hint} />}
      </LessonSection>

      {subject.readings && subject.readings.length > 0 && (
        <LessonSection title="Reading">
          <ReadingList readings={subject.readings} />
          {subject.reading_mnemonic && <Mnemonic text={subject.reading_mnemonic} />}
          {subject.reading_hint && <Mnemonic text={subject.reading_hint} />}
        </LessonSection>
      )}

      {components.length > 0 && (
        <LessonSection title="Made of">
          <ComponentList components={components} />
        </LessonSection>
      )}

      {subject.context_sentences && subject.context_sentences.length > 0 && (
        <LessonSection title="In context">
          <SentenceList sentences={subject.context_sentences} />
        </LessonSection>
      )}
    </article>
  )
}

function LessonSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  )
}

function MeaningList({ subject }: { subject: Subject }) {
  const [primary, ...others] = subject.meanings.filter((meaning) => meaning.accepted_answer)

  return (
    <p className="answers">
      {primary?.meaning}
      {others.length > 0 && <span className="alternatives">{others.map((other) => other.meaning).join(', ')}</span>}
    </p>
  )
}

function ReadingList({ readings }: { readings: readonly Reading[] }) {
  const groups = READING_TYPES.map(({ type, name }) => ({
    name,
    readings: readings.filter((reading) => reading.type === type),
  })).filter((group) => group.readings.length > 0)

  return (
    <dl className="readings">
      {groups.map((group) => (
        <div key={group.name}>
          <dt className={group.name === 'Readings' ? 'visually-hidden' : undefined}>{group.name}</dt>
          <dd lang="ja">
            {group.readings.map((reading) => (
              <span key={reading.reading} className={reading.accepted_answer ? 'accepted' : undefined}>
                {reading.reading}
              </span>
            ))}
          </dd>
        </div>
      ))}
    </dl>
  )
}

function ComponentList({ components }: { components: readonly Resource<Subject>[] }) {
  return (
    <ul className="components">
      {components.map((component) => (
        <li key={component.id} data-type={component.object}>
          <span lang="ja">{component.data.characters ?? component.data.slug}</span>
          {component.data.meanings.find((meaning) => meaning.primary)?.meaning}
        </li>
      ))}
    </ul>
  )
}

function SentenceList({ sentences }: { sentences: readonly ContextSentence[] }) {
  return (
    <ul className="sentences">
      {sentences.map((sentence) => (
        <li key={sentence.ja}>
          <p lang="ja">{sentence.ja}</p>
          <p>{sentence.en}</p>
        </li>
      ))}
    </ul>
  )
}
