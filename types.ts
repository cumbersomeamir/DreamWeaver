
export interface Story {
  title: string;
  content: string;
  imageUrl?: string;
  audioData?: string;
}

export interface StoryParams {
  theme: string;
  character: string;
  setting: string;
}

export enum AppStatus {
  IDLE = 'IDLE',
  GENERATING_STORY = 'GENERATING_STORY',
  GENERATING_IMAGE = 'GENERATING_IMAGE',
  GENERATING_AUDIO = 'GENERATING_AUDIO',
  READY = 'READY',
  ERROR = 'ERROR'
}
