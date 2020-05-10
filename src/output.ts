import { IConfigEntry } from './i-config-entry';
import * as clipboardy from 'clipboardy';
import { table } from 'table';

function determineDateDifferenceMasterDevelop(config: IConfigEntry): number {
  const millisecondsPerDay = 24 * 60 * 60 * 1000;

  const dateDevelop = new Date(config.develop.lastCommitDate);
  const dateMaster = new Date(config.master.lastCommitDate);
  // console.log("config.develop.lastCommitDate", config.develop.lastCommitDate);
  // console.log("dateDevelop", dateDevelop);
  // console.log("dateMaster", dateMaster);
  const diffDays =
    (dateDevelop.getTime() - dateMaster.getTime()) / millisecondsPerDay;

  return Math.round(diffDays);
}

function determineNoteText(config: IConfigEntry): string {
  let note: string = '';
  if (
    config.develop.version === 'unknown' ||
    config.develop.version === undefined ||
    config.develop.version === null
  ) {
    note = 'version not found';
    config.develop.version = '?';
  }
  if (
    config.master.version === 'unknown' ||
    config.master.version === undefined ||
    config.master.version === null
  ) {
    note = 'version not found';
    config.master.version = '?';
  }
  if (
    config.master.version === '0.0.0' ||
    config.master.version === '0.0.1' ||
    config.master.version === 'version 0.0.1-SNAPSHOT' ||
    config.master.version === '0.0.1-SNAPSHOT'
  ) {
    note = '**check version**';
  } else if (config.develop.version !== config.master.version) {
    note = '**update** needed?';
  }
  return note;
}

export async function outputAsAscii(
  configs: IConfigEntry[],
  copyToClipboard: boolean,
) {
  let data = [];

  // table.setHeading(
  //   'Project',
  //   'Live / Master',
  //   'Integration / Develop',
  //   'DayDiff',
  //   'CommitDiff',
  //   'Note',
  // );
  //
  configs
    .sort((entryA, entryB) =>
      entryA.repository.localeCompare(entryB.repository),
    )
    .forEach((config) => {
      let note = determineNoteText(config);
      data.push([
        config.repository,
        config.master.version,
        config.develop.version,
        determineDateDifferenceMasterDevelop(config),
        config.develop.numberOfCommits - config.master.numberOfCommits,
        note,
      ]);
    });

  console.log();
  let result = '';
  result += `_generated ${new Date().toLocaleString()}_\n`;
  result += table(data);
  result += '\n';
  result += 'Info:\n';
  result += '* version are based on the tags of the branch\n';
  result +=
    '* day diff is the difference of last commit in development vs master\n';
  result +=
    '* commit diff is the difference of last commit in development vs master\n';
  result +=
    '* release-v2020407112300000 will be shown as 2020.40.7112300000 as it is no valid semver\n';
  result += '\n';

  console.log('');
  console.log(
    '---✂---✂---✂---✂---✂---✂---✂---✂---✂---✂---✂---✂---✂---✂---✂---✂---✂---✂---\n\n',
  );
  console.log(result);
  if (copyToClipboard) {
    clipboardy.writeSync(result);
  }
  console.log(
    '---✂---✂---✂---✂---✂---✂---✂---✂---✂---✂---✂---✂---✂---✂---✂---✂---✂---✂---\n\n',
  );
  if (copyToClipboard) {
    console.log('');
    console.log('Info: result was copied to clipboard');
  }
}

export async function outputAsMarkdown(
  configs: IConfigEntry[],
  copyToClipboard: boolean,
) {
  let result = '';
  result += `_generated ${new Date().toLocaleString()}_\n`;
  result += '\n';
  result +=
    '|Project|Live / Master|Integration / Develop|DayDiff|CommitDiff|Note|\n';
  result += '| :--- | ---: | ---: | ---: | ---: | :--- |\n';
  configs
    .sort((entryA, entryB) =>
      entryA.repository.localeCompare(entryB.repository),
    )
    .forEach((config) => {
      let note = determineNoteText(config);

      result += `|${config.repository} | \
       ${config.master.version} | \
       ${config.develop.version} | \
       ${determineDateDifferenceMasterDevelop(config)} | \
       ${config.develop.numberOfCommits - config.master.numberOfCommits} | \
       ${note} | \
       \n`;
    });

  result += '\n';
  result += 'Info:\n';
  result += '* version are based on the tags of the branch\n';
  result +=
    '* day diff is the difference of last commit in development vs master\n';
  result +=
    '* commit diff is the difference of last commit in development vs master\n';
  result +=
    '* release-v2020407112300000 will be shown as 2020.40.7112300000 as it is no valid semver\n';
  result += '\n';

  console.log('');
  console.log(
    '---✂---✂---✂---✂---✂---✂---✂---✂---✂---✂---✂---✂---✂---✂---✂---✂---✂---✂---\n\n',
  );
  console.log(result);
  if (copyToClipboard) {
    clipboardy.writeSync(result);
  }
  console.log(
    '---✂---✂---✂---✂---✂---✂---✂---✂---✂---✂---✂---✂---✂---✂---✂---✂---✂---✂---\n\n',
  );
  if (copyToClipboard) {
    console.log('');
    console.log('Info: result was copied to clipboard');
  }
}
