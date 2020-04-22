import { outputVersionInfo } from './output';
import { configs } from './config/config';
import { IConfigEntry } from './i-config-entry';
import { GitActions } from './git-actions';

require('dotenv').config();

const gitActions = new GitActions();

async function fillCommitDates(config: IConfigEntry) {
  config.develop.lastCommitDate = await gitActions.getLastCommitDate(
    config.repository,
    'develop',
    config.owner
  );
  config.master.lastCommitDate = await gitActions.getLastCommitDate(
    config.repository,
    'master',
    config.owner
  );
}
async function collectVersionInfo() {
  for (const config of configs) {
    await fillCommitDates(config);

    config.develop.version = await gitActions.getHighestTag(
      config.repository,
      'develop',
      config.owner
    );
    config.master.version = await gitActions.getHighestTag(
      config.repository,
      'master',
      config.owner
    );
  }
}

const start = async () => {
  await collectVersionInfo();
  await outputVersionInfo(configs);
};

start().catch(console.error);
