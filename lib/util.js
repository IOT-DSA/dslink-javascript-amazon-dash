const bannedChars = {
  '%': '%25',
  '.': '%2E',
  '/': '%2F',
  '\\': '%5C',
  '?': '%3F',
  '*': '%2A',
  ':': '%3A',
  '|': '%7C',
  '<': '%3C',
  '>': '%3E',
  '$': '%24',
  '@': '%40',
  ',': '%2C'
};

export function urlEncode(string) {
  Object.keys(bannedChars).forEach((char) => {
    string = string.split(char).join(bannedChars[char]);
  });

  return string;
}
