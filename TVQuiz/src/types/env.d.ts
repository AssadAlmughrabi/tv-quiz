declare module '@env' {
  export const TRIVIA_API_URL: string;
}

/** Web build: importing a sound file gives its URL (webpack asset/resource). */
declare module '*.wav' {
  const url: string;
  export default url;
}
