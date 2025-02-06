export const FLAGS = {
  SCOREBOARD_VISIBLE: 'SCOREBOARD_VISIBLE',
  MAINTENANCE_MODE: 'MAINTENANCE_MODE'
} as const;

export type FlagName = keyof typeof FLAGS;
export type FlagValue = boolean;
export type Flags = Record<FlagName, FlagValue>;

export default FLAGS;