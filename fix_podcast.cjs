const fs = require('fs');
let code = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');

code = code.replace(
`        setPodcastProgress(prev => {
          if (prev >= podcastDuration) {
            setPodcastPlaying(false);
            return 0;
          }
          return prev + 1;
        });`,
`        setPodcastProgress(prev => {
          if (prev >= podcastDuration) {
            setTimeout(() => setPodcastPlaying(false), 0);
            return 0;
          }
          return prev + 1;
        });`
);

let code2 = fs.readFileSync('src/components/bank/BankDashboard.tsx', 'utf8');
code2 = code2.replace(
`        setPodcastProgress(prev => {
          if (prev >= podcastDuration) {
            setPodcastPlaying(false);
            return 0;
          }
          return prev + 1;
        });`,
`        setPodcastProgress(prev => {
          if (prev >= podcastDuration) {
            setTimeout(() => setPodcastPlaying(false), 0);
            return 0;
          }
          return prev + 1;
        });`
);

fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', code);
fs.writeFileSync('src/components/bank/BankDashboard.tsx', code2);
console.log("Fixed podcast progress");
