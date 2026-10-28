/* eslint-env jest */
// Jest has no TV: every import of the platform gets the fake one.
jest.mock('core/platform/platform', () => require('core/platform/platform.mock'));
// Jest has no audio: the native sound module is replaced by a silent one.
jest.mock('react-native-sound', () =>
  jest.fn().mockImplementation((_file, _folder, onLoad) => {
    onLoad?.(null);
    return { play: jest.fn(), stop: jest.fn(cb => cb?.()) };
  }),
);
