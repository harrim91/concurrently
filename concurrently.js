const concurrently = (tasks, concurrency, onTaskError) => {
  const pool = tasks.slice(0);
  const thread = (resolve, i) => {
    if (pool.length === 0) {
      resolve();
    } else {
      (pool.shift())(i).catch(onTaskError).then(() => thread(resolve, i));
    }
  };
  return Array(concurrency).fill(null)
    .map((t, i) => new Promise(r => thread(r, i)));
};

module.exports = concurrently;
