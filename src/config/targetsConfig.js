import characterDb from './character_database.json';

// Array of targets supporting up to 11 targets
export const targetsConfig = Object.keys(characterDb).map((key, idx) => {
  return {
    index: idx,
    id: key,
    titleKey: `targets.${key}.name`,
    data: characterDb[key]
  };
});
