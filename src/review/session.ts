import type { ReviewItem } from './buildReviewQueue'

// How many items are in play at once. Questions are drawn at random from
// these, so an item's meaning and reading aren't always asked back to back.
const ACTIVE_ITEMS = 10

export type QuestionType = 'meaning' | 'reading'

export interface SessionItem extends ReviewItem {
  isMeaningDone: boolean
  isReadingDone: boolean
  incorrectMeaningAnswers: number
  incorrectReadingAnswers: number
}

export interface Question {
  item: SessionItem
  type: QuestionType
}

export interface ReviewSession {
  active: SessionItem[]
  waiting: SessionItem[]
  completed: SessionItem[]
  question: Question | null
  // True while the answer to `question` is shown after a wrong answer.
  isShowingAnswer: boolean
  // Goes up each time a new question is asked, including the same question asked again.
  questionNumber: number
  correctAnswers: number
  totalAnswers: number
}

type Random = () => number

export function startSession(queue: readonly ReviewItem[], random: Random = Math.random): ReviewSession {
  const items = queue.map((item) => ({
    ...item,
    isMeaningDone: false,
    isReadingDone: !hasReading(item),
    incorrectMeaningAnswers: 0,
    incorrectReadingAnswers: 0,
  }))
  const session = {
    active: items.slice(0, ACTIVE_ITEMS),
    waiting: items.slice(ACTIVE_ITEMS),
    completed: [],
    question: null,
    isShowingAnswer: false,
    questionNumber: 1,
    correctAnswers: 0,
    totalAnswers: 0,
  }
  return { ...session, question: pickQuestion(session.active, null, random) }
}

export function answerCorrectly(session: ReviewSession, random: Random = Math.random): ReviewSession {
  const { question } = session
  if (!question || session.isShowingAnswer) return session

  const item = { ...question.item, ...(question.type === 'meaning' ? { isMeaningDone: true } : { isReadingDone: true }) }
  const isComplete = item.isMeaningDone && item.isReadingDone
  const otherActive = session.active.filter((other) => other !== question.item)
  const active = isComplete ? [...otherActive, ...session.waiting.slice(0, 1)] : [...otherActive, item]

  return {
    ...session,
    active,
    waiting: isComplete ? session.waiting.slice(1) : session.waiting,
    completed: isComplete ? [...session.completed, item] : session.completed,
    question: pickQuestion(active, question, random),
    questionNumber: session.questionNumber + 1,
    correctAnswers: session.correctAnswers + 1,
    totalAnswers: session.totalAnswers + 1,
  }
}

export function answerWrongly(session: ReviewSession): ReviewSession {
  const { question } = session
  if (!question || session.isShowingAnswer) return session

  const item = {
    ...question.item,
    ...(question.type === 'meaning'
      ? { incorrectMeaningAnswers: question.item.incorrectMeaningAnswers + 1 }
      : { incorrectReadingAnswers: question.item.incorrectReadingAnswers + 1 }),
  }
  return {
    ...session,
    active: session.active.map((other) => (other === question.item ? item : other)),
    question: { item, type: question.type },
    isShowingAnswer: true,
    totalAnswers: session.totalAnswers + 1,
  }
}

// "That was a typo": forget the wrong answer just given and ask the same question again.
export function undoWrongAnswer(session: ReviewSession): ReviewSession {
  const { question } = session
  if (!question || !session.isShowingAnswer) return session

  const item = {
    ...question.item,
    ...(question.type === 'meaning'
      ? { incorrectMeaningAnswers: question.item.incorrectMeaningAnswers - 1 }
      : { incorrectReadingAnswers: question.item.incorrectReadingAnswers - 1 }),
  }
  return {
    ...session,
    active: session.active.map((other) => (other === question.item ? item : other)),
    question: { item, type: question.type },
    isShowingAnswer: false,
    totalAnswers: session.totalAnswers - 1,
  }
}

// Moves on after a wrong answer has been shown. The question goes back in the pool.
export function moveOn(session: ReviewSession, random: Random = Math.random): ReviewSession {
  if (!session.isShowingAnswer) return session
  return {
    ...session,
    isShowingAnswer: false,
    question: pickQuestion(session.active, session.question, random),
    questionNumber: session.questionNumber + 1,
  }
}

function hasReading({ subject }: ReviewItem) {
  return (subject.data.readings?.length ?? 0) > 0
}

// A random unanswered question, avoiding the one just asked when there's any other choice.
function pickQuestion(active: readonly SessionItem[], previous: Question | null, random: Random): Question | null {
  const questions = active.flatMap((item) => [
    ...(item.isMeaningDone ? [] : [{ item, type: 'meaning' as const }]),
    ...(item.isReadingDone ? [] : [{ item, type: 'reading' as const }]),
  ])
  const isPrevious = (q: Question) =>
    previous !== null && q.item.assignment.id === previous.item.assignment.id && q.type === previous.type
  const choices = questions.length > 1 ? questions.filter((q) => !isPrevious(q)) : questions
  return choices[Math.floor(random() * choices.length)] ?? null
}
