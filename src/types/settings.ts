export interface AppSettings {
  dyslexicFont: boolean;
  colorblindMode: boolean;
  reduceMotion: boolean;
  hardMode: boolean;
  soundEnabled: boolean;
  dynamicTheme: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  dyslexicFont: false,
  colorblindMode: false,
  reduceMotion: false,
  hardMode: false,
  soundEnabled: true,
  dynamicTheme: false,
};
