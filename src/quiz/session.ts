import type { StudyItem } from '../data/studyItem'

const ACTIVE_ITEMS = 10

export type QuestionType = 'meaning' | 'reading'

export interface SessionItem extends StudyItem {
  isMeaningDone: boolean
  isReadingDone: boolean
  incorrectMeaningAnswers: number
  incorrectReadingAnswers: number
}

export interface Question {
  item: SessionItem
  type: QuestionType
}

export interface QuizSession {
  active: SessionItem[]
  waiting: SessionItem[]
  completed: SessionItem[]
  question: Question | null
  isShowingAnswer: boolean
  questionNumber: number
  correctAnswers: number
  totalAnswers: number
}

export function createSession(queue: readonly StudyItem[]): QuizSession {
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
  return { ...session, question: pickQuestion(session.active, null) }
}

export function answerCorrectly(session: QuizSession): QuizSession {
  const { question } = session
  if (!question || session.isShowingAnswer) return session

  const item = markQuestionDone(question)
  const isComplete = item.isMeaningDone && item.isReadingDone
  const next = isComplete ? completeItem(session, question.item, item) : replaceItem(session, question.item, item)

  return {
    ...next,
    question: { item, type: question.type },
    correctAnswers: session.correctAnswers + 1,
    totalAnswers: session.totalAnswers + 1,
  }
}

export function answerWrongly(session: QuizSession): QuizSession {
  const { question } = session
  if (!question || session.isShowingAnswer) return session

  const item = changeWrongAnswerCount(question, 1)

  return {
    ...replaceItem(session, question.item, item),
    question: { item, type: question.type },
    isShowingAnswer: true,
    totalAnswers: session.totalAnswers + 1,
  }
}

export function undoWrongAnswer(session: QuizSession): QuizSession {
  const { question } = session
  if (!question || !session.isShowingAnswer) return session

  const item = changeWrongAnswerCount(question, -1)

  return {
    ...replaceItem(session, question.item, item),
    question: { item, type: question.type },
    isShowingAnswer: false,
    totalAnswers: session.totalAnswers - 1,
  }
}

export function askNextQuestion(session: QuizSession): QuizSession {
  return {
    ...session,
    isShowingAnswer: false,
    question: pickQuestion(session.active, session.question),
    questionNumber: session.questionNumber + 1,
  }
}

function markQuestionDone({ item, type }: Question): SessionItem {
  return type === 'meaning' ? { ...item, isMeaningDone: true } : { ...item, isReadingDone: true }
}

function changeWrongAnswerCount({ item, type }: Question, change: number): SessionItem {
  return type === 'meaning'
    ? { ...item, incorrectMeaningAnswers: item.incorrectMeaningAnswers + change }
    : { ...item, incorrectReadingAnswers: item.incorrectReadingAnswers + change }
}

function replaceItem(session: QuizSession, oldItem: SessionItem, newItem: SessionItem): QuizSession {
  return { ...session, active: session.active.map((item) => (item === oldItem ? newItem : item)) }
}

function completeItem(session: QuizSession, oldItem: SessionItem, completedItem: SessionItem): QuizSession {
  const [nextItem, ...waiting] = session.waiting
  const otherItems = session.active.filter((item) => item !== oldItem)

  return {
    ...session,
    active: nextItem ? [...otherItems, nextItem] : otherItems,
    waiting,
    completed: [...session.completed, completedItem],
  }
}

function hasReading({ subject }: StudyItem) {
  return (subject.data.readings?.length ?? 0) > 0
}

function pickQuestion(active: readonly SessionItem[], previous: Question | null): Question | null {
  const questions = active.flatMap((item) => [
    ...(item.isMeaningDone ? [] : [{ item, type: 'meaning' as const }]),
    ...(item.isReadingDone ? [] : [{ item, type: 'reading' as const }]),
  ])

  const isPrevious = (q: Question) =>
    previous !== null && q.item.assignment.id === previous.item.assignment.id && q.type === previous.type
  const choices = questions.length > 1 ? questions.filter((q) => !isPrevious(q)) : questions

  return choices[Math.floor(Math.random() * choices.length)] ?? null
}
