// Every view the app serves. The smoke suite loads each one on desktop and on a 375px phone and
// runs axe on it, so a new view or fixture is covered as soon as it is listed here.
export const views = [
  "/?part=a&fixture=active",
  "/?part=a&fixture=paused",
  "/?part=a&fixture=cancelled",
  "/?part=a&fixture=error",
  "/?part=b",
];
