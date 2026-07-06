import cron from 'node-cron';
import gmailController from '../services/gmail/gmail.controller.js';

const tasks = [];

function register(name, expression, handler, options = {}) {
  const task = cron.schedule(expression, handler, {
    name,
    ...options,
  });

  tasks.push(task);
  return task;
}

export function stopCronJobs() {
  for (const task of tasks) {
    task.stop();
  }
  tasks.length = 0;
}

export function restartCronJobs() {
  stopCronJobs();
  startCronJobs();
}

export function startCronJobs() {
  if (tasks.length) return tasks;

  // Runs every day at 9:00 AM and 6:00 PM
  register("GetMail's", '0 0 9,18 * * *', () => {
    console.log(`[cron] GetMail's: ${new Date().toISOString()}`);
    gmailController.getRecentMessages();
  });

  register("sendMail's", '0 0 9,18 * * *', async () => {
    console.log(`[cron] sendMail's: ${new Date().toISOString()}`);
    await gmailController.sendMails();
  });
  return tasks;
}