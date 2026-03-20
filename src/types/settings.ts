export interface AppSettings {
  dyslexicFont: boolean;
  colorblindMode: boolean;
  reduceMotion: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  dyslexicFont: false,
  colorblindMode: false,
  reduceMotion: false,
};
