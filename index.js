const concurrently = require('./concurrently');

const TOTAL_THREADS = 10;
const TOTAL_TASKS = 100;
const MAX_TASK_DURATION = 1000;

const statistics = Array(TOTAL_THREADS).fill(null)
  .reduce((acc, thread, index) => Object.assign({}, acc, {
    [index]: { tasks: 0, time: 0 },
  }), {});

const tasks = Array(TOTAL_TASKS).fill(null)
  .map((task, i) => thread => new Promise((resolve, reject) => {
    console.log(
      '\x1b[33m%s\x1b[0m',
      '[Starting]',
      'Thread:', thread,
      'Task:', i,
    );

    const time = Math.ceil(Math.random() * MAX_TASK_DURATION);
    setTimeout(() => {
      console.log(
        '\x1b[32m%s\x1b[0m',
        '[Complete]',
        'Thread:', thread,
        'Task:', i,
        `[${time} ms]`,
      );

      statistics[thread].tasks += 1;
      statistics[thread].time += time;

      if (i % 14 === 0) {
        reject(new Error(`${i} is divisible by 14`));
      } else {
        resolve();
      }
    }, time);
  }));

const handleTaskError = error => console.log(
  '\x1b[31m%s\x1b[0m',
  '[Error]   ',
  error.message,
);

console.time('Complete in');
Promise.all(concurrently(tasks, TOTAL_THREADS, handleTaskError)).then(() => {
  console.timeEnd('Complete in');
  console.log(statistics);
  const values = Object.values(statistics);

  const completed = values.map(thread => thread.tasks);

  const most = Math.max(...completed);
  const fewest = Math.min(...completed);
  console.log('Expected Tasks:', TOTAL_TASKS / TOTAL_THREADS);
  console.log('Most Tasks:', most);
  console.log('Fewest Tasks:', fewest);
  console.log('Difference:', Math.abs(most - fewest));
  console.log('Max Deviation:', most - (TOTAL_TASKS / TOTAL_THREADS));
  console.log('Min Deviation:', (TOTAL_TASKS / TOTAL_THREADS) - fewest);

  const times = values.map(thread => thread.time);
  const fastest = Math.min(...times);
  const slowest = Math.max(...times);
  console.log('Target:', (MAX_TASK_DURATION * TOTAL_TASKS) / TOTAL_THREADS);
  console.log('Fastest:', fastest);
  console.log('Slowest:', slowest);
  console.log('Difference:', Math.abs(fastest - slowest), `(Target: ${MAX_TASK_DURATION})`);
});
