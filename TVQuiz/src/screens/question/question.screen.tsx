import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AsyncView } from 'core/components/async-view/async-view';
import { Dialog } from 'core/components/dialog/dialog';
import { SkeletonBox } from 'core/components/skeleton/skeleton';
import { TVImage } from 'core/components/tv-image/tv-image';
import { CONTENT_WIDTH, SAFE_AREA } from 'core/constants/layout.const';
import { COLORS } from 'core/constants/theme-colors.const';
import { useAsyncData } from 'core/hooks/use-async-data';
import { textAlignStart } from 'core/i18n/direction';
import { useLanguage } from 'core/i18n/language.context';
import { platform } from 'core/platform/platform';
import {
  ScreenProps,
  useBackHandler,
  useNavigation,
} from 'core/navigation/navigation.context';
import {
  currentAnswer,
  currentQuestion,
  isPaused,
  remainingMs,
  toResult,
} from 'core/services/quiz-session.service';
import { quizService } from 'core/services/quiz.service';
import { formatNumber } from 'core/utils/format.utils';
import { scale } from 'core/utils/scale.utils';
import { Question } from 'types/question.interface';
import { Quiz } from 'types/quiz.interface';
import { AnswerRecord } from 'types/score.interface';
import {
  AnswerChoice,
  CHOICE_HEIGHT,
  ChoiceState,
} from 'core/components/answer-choice/answer-choice';
import { CountdownBar } from 'core/components/countdown-bar/countdown-bar';
import { useOnline } from 'core/hooks/use-online';
import { useQuizSession } from 'core/hooks/use-quiz-session';
import { useSound } from 'core/hooks/use-sound';

const LETTERS = ['A', 'B', 'C', 'D'];
const CHOICE_GAP = scale(24);
const CHOICE_WIDTH = (CONTENT_WIDTH - CHOICE_GAP) / 2;

/** The question area always has this height, with or without an image, so the choices never move. */
const QUESTION_AREA_HEIGHT = scale(340);
const IMAGE = { width: scale(560), height: scale(315) }; // 16:9

export function QuestionScreen({ route }: ScreenProps<'question'>) {
  const { quizId } = route.params;
  const { lang, t } = useLanguage();
  const { goBack } = useNavigation();

  // The quiz (title, time per question) and then its questions from the Trivia API.
  const data = useAsyncData(
    async signal => {
      const quiz = await quizService.getQuiz(quizId, lang);
      const questions = await quizService.getQuestions(quiz, signal);
      return { quiz, questions };
    },
    [quizId, lang],
  );

  return (
    <View style={styles.screen}>
      <AsyncView
        status={data.status}
        onRetry={data.retry}
        takeFocus
        emptyAction={{ label: t.category.backToHome, onPress: goBack }}
        loading={
          <View style={styles.content}>
            <QuestionSkeleton />
          </View>
        }
      >
        {() =>
          data.data && (
            <QuizPlayer quiz={data.data.quiz} questions={data.data.questions} />
          )
        }
      </AsyncView>
    </View>
  );
}

/** Plays the quiz once the questions are loaded. The engine decides; this only draws. */
function QuizPlayer({
  quiz,
  questions,
}: {
  quiz: Quiz;
  questions: Question[];
}) {
  const { lang, t } = useLanguage();
  const { replace, goBack } = useNavigation();
  const { session, now, answer, pause, resume } = useQuizSession(
    questions,
    quiz.secondsPerQuestion,
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  // The answer that had focus, to give it focus back when the dialog closes.
  const lastFocused = useRef(0);
  const [restoreIndex, setRestoreIndex] = useState(0);

  const openQuitDialog = useCallback(() => {
    pause();
    setDialogOpen(true);
  }, [pause]);

  // Stable, so the memoized answer cards do not redraw on every timer tick.
  const rememberChoice = useCallback((index: number) => {
    lastFocused.current = index;
  }, []);

  const closeQuitDialog = () => {
    setDialogOpen(false);
    setRestoreIndex(lastFocused.current);
    resume();
  };

  // Back during the quiz asks first. While the dialog is open, its own Back handler runs
  // first and closes it, so two quick Back presses never leave the quiz by accident.
  useBackHandler(() => {
    openQuitDialog();
    return true;
  }, !dialogOpen);

  // Home button or standby: pause, and come back to the quit dialog with the timer stopped.
  useEffect(
    () =>
      platform.onAppStateChange(state => {
        if (state === 'background') {
          openQuitDialog();
        }
      }),
    [openQuitDialog],
  );

  const questionId = currentQuestion(session)?.id;
  useEffect(() => {
    // A new question starts on its first answer.
    lastFocused.current = 0;
    setRestoreIndex(0);
  }, [questionId]);

  // The questions are already loaded, so the quiz goes on offline; the player is still told.
  const online = useOnline();

  // One sound per answer, chosen or timed out: the answers list grows by one each time.
  const playSound = useSound();
  const answerCount = session.answers.length;
  const lastAnswer = session.answers[answerCount - 1];
  useEffect(() => {
    if (lastAnswer) {
      playSound(lastAnswer.isCorrect ? 'correct' : 'wrong');
    }
    // Only when a new answer arrives, not when the Sound setting changes.
  }, [answerCount]);

  // Last question done: swap this screen for the result, so Back from the result
  // does not return into a finished quiz.
  useEffect(() => {
    if (session.phase === 'finished') {
      replace({
        name: 'result',
        params: { result: toResult(session, quiz, Date.now()) },
      });
    }
  }, [session, quiz, replace]);

  const question = currentQuestion(session);
  if (!question || session.phase === 'finished') {
    return null;
  }

  const given = currentAnswer(session);
  const timedOut = given?.choiceId === null;
  const running = session.phase === 'answering' && !isPaused(session);

  return (
    <>
      {/* Hidden from the screen reader while the dialog covers it. */}
      <View
        style={styles.content}
        importantForAccessibility={dialogOpen ? 'no-hide-descendants' : 'auto'}
      >
        <View style={styles.topBar}>
          <Text style={styles.quizTitle} numberOfLines={1}>
            {quiz.title}
          </Text>
          <Text style={styles.progress}>
            {t.question.progress} {formatNumber(session.index + 1, lang)} /{' '}
            {formatNumber(questions.length, lang)}
          </Text>
        </View>

        <CountdownBar
          // During feedback the timer freezes at the moment of the answer (0 only if time ran out).
          remainingMs={
            given
              ? Math.max(0, session.limitMs - given.timeMs)
              : remainingMs(session, now)
          }
          limitMs={session.limitMs}
          running={running}
          questionKey={question.id}
        />

        {/* Follows the app's direction: in Arabic the question sits on the right,
            still written left-to-right when it is English. */}
        <View style={styles.questionArea}>
          <Text
            accessibilityRole="header"
            style={[
              styles.questionText,
              question.contentLanguage === 'en' && styles.leftToRight,
              textAlignStart(lang),
            ]}
            numberOfLines={5}
          >
            {question.text}
          </Text>
          {question.imageUrl && (
            // key: a new question gets a fresh image box (and forgets the last one's error).
            <TVImage
              key={question.id}
              uri={question.imageUrl}
              width={IMAGE.width}
              height={IMAGE.height}
            />
          )}
        </View>

        {/* Reserved line, so these messages never push anything down. "Time's up" wins
            for its moment; otherwise the player is told while the connection is gone. */}
        <Text
          style={[styles.notice, !timedOut && !online && styles.offlineNotice]}
          accessibilityLiveRegion="polite"
          numberOfLines={1}
        >
          {timedOut
            ? `⏱ ${t.question.timeUp}`
            : online
            ? ''
            : `⚠ ${t.question.offline}`}
        </Text>

        <View style={styles.choices}>
          {question.choices.map((choice, i) => (
            <View key={choice.id} style={styles.choiceCell}>
              <AnswerChoice
                choiceId={choice.id}
                index={i}
                letter={LETTERS[i]}
                text={choice.text}
                state={choiceState(choice.id, question, given)}
                textLanguage={question.contentLanguage}
                // New question: focus starts on A. After the dialog: back on the answer it left.
                hasTVPreferredFocus={!dialogOpen && i === restoreIndex}
                onFocus={rememberChoice}
                onPress={answer}
              />
            </View>
          ))}
        </View>
      </View>

      {dialogOpen && (
        <Dialog
          title={t.question.quitTitle}
          message={t.question.quitMessage}
          actions={[
            { label: t.question.continue, onPress: closeQuitDialog },
            { label: t.question.quit, onPress: goBack },
          ]}
          onCancel={closeQuitDialog}
        />
      )}
    </>
  );
}

/** While answering every choice is idle; during feedback the right one and a wrong pick are shown. */
function choiceState(
  choiceId: string,
  question: Question,
  given: AnswerRecord | undefined,
): ChoiceState {
  if (!given) {
    return 'idle';
  }
  if (choiceId === question.correctChoiceId) {
    return 'correct';
  }
  return choiceId === given.choiceId ? 'wrong' : 'dimmed';
}

/** Same layout as the real question, so nothing jumps when the questions arrive. */
function QuestionSkeleton() {
  return (
    <>
      <View style={styles.topBar}>
        <SkeletonBox width={scale(480)} height={scale(36)} />
        <SkeletonBox width={scale(220)} height={scale(36)} />
      </View>
      <SkeletonBox width="100%" height={scale(14)} />
      <View style={styles.questionArea}>
        <View style={styles.skeletonLines}>
          <SkeletonBox width="90%" height={scale(48)} />
          <SkeletonBox width="70%" height={scale(48)} />
        </View>
      </View>
      <Text style={styles.notice} />
      <View style={styles.choices}>
        {LETTERS.map(letter => (
          <View key={letter} style={styles.choiceCell}>
            <SkeletonBox
              width="100%"
              height={CHOICE_HEIGHT}
              radius={scale(16)}
            />
          </View>
        ))}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  // Padding here, not on the screen, so the dialog overlay can cover the whole screen.
  content: {
    flex: 1,
    paddingHorizontal: SAFE_AREA.horizontal,
    paddingVertical: SAFE_AREA.vertical,
  },
  topBar: {
    height: scale(64),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: scale(24),
    marginBottom: scale(16),
  },
  quizTitle: {
    flex: 1,
    color: COLORS.textMuted,
    fontSize: scale(30),
    fontWeight: '600',
  },
  progress: { color: COLORS.text, fontSize: scale(30), fontWeight: '800' },
  questionArea: {
    height: QUESTION_AREA_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(40),
    marginTop: scale(32),
  },
  questionText: {
    flex: 1,
    color: COLORS.text,
    fontSize: scale(46),
    lineHeight: scale(58),
    fontWeight: '700',
  },
  // English API text keeps its own reading order (the "?" stays at the end) inside Arabic.
  leftToRight: { writingDirection: 'ltr' },
  notice: {
    height: scale(48),
    lineHeight: scale(48),
    marginVertical: scale(8),
    color: COLORS.wrong,
    fontSize: scale(30),
    fontWeight: '800',
  },
  // A warning, not a wrong answer: accent colour, plus the ⚠ sign, not colour alone.
  offlineNotice: { color: COLORS.accent },
  skeletonLines: { flex: 1, gap: scale(20) },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: CHOICE_GAP },
  choiceCell: { width: CHOICE_WIDTH },
});
