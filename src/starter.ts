import { Octokit } from "@octokit/rest";
import { outputVersionInfo } from "./output";
import { configs } from "./config/config";
import { IConfigEntry } from "./i-config-entry";
import * as compareSemver from "compare-semver";
import * as semver from "semver";

require("dotenv").config();

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
  userAgent: "version-info v0.1",
});

async function getLastCommitDate(
  repository: string,
  branch: string,
  owner: string
): Promise<string> {
  const latestCommit = await octokit.repos.getCommit({
    repo: repository,
    ref: branch,
    owner: owner,
  });
  // console.log("latestCommit", latestCommit.data.sha);

  const commitContent = await octokit.git.getCommit({
    commit_sha: latestCommit.data.sha,
    repo: repository,
    owner: owner,
  });
  // console.log("commitContent", commitContent.data.author.date);

  return commitContent.data.author.date;
}

async function fillCommitDates(config: IConfigEntry) {
  config.develop.lastCommitDate = await getLastCommitDate(
    config.repository,
    "develop",
    config.owner
  );
  config.master.lastCommitDate = await getLastCommitDate(
    config.repository,
    "master",
    config.owner
  );
}
async function collectVersionInfo() {
  for (const config of configs) {
    await fillCommitDates(config);

    // let contentMaster = "unknown";
    // try {
    //   contentMaster = await getContent(
    //     config.fileName,
    //     config.repository,
    //     "master",
    //     config.owner
    //   );
    // } catch (e) {
    //   console.error(e);
    //   contentMaster = JSON.stringify({ version: "none" });
    // }
    //
    // let contentDevelop = "unknown";
    // try {
    //   contentDevelop = await getContent(
    //     config.fileName,
    //     config.repository,
    //     "develop",
    //     config.owner
    //   );
    // } catch (e) {
    //   console.error(e);
    //   contentDevelop = JSON.stringify({ version: "none" });
    // }
    // if (config.type === "NODE") {
    //   // console.log("contentMaster", config.repository);
    //   // // console.log("contentMaster", contentMaster);
    //   // console.log("contentMaster", JSON.parse(contentMaster).version);
    //   config.master.version = JSON.parse(contentMaster).version;
    //   // // console.log("contentDevelop", contentDevelop);
    //   // console.log("contentDevelop", JSON.parse(contentDevelop).version);
    //   config.develop.version = JSON.parse(contentDevelop).version;
    // } else {
    //   config.master.version = contentMaster //
    //     .split("\n")
    //     .filter((line) => line.startsWith("version"))
    //     .map((line) => (line.indexOf("=") != -1 ? line.split("=")[1] : line))
    //     .map((line) => line.replace(/'/g, ""))
    //     .map((line) => line.trim())
    //     .pop();
    //   config.develop.version = contentDevelop //
    //     .split("\n")
    //     .filter((line) => line.startsWith("version"))
    //     .map((line) => (line.indexOf("=") != -1 ? line.split("=")[1] : line))
    //     .map((line) => line.replace(/'/g, ""))
    //     .map((line) => line.trim())
    //     .pop();
    // }
    config.develop.version = await getHighestTag(
      config.repository,
      "develop",
      config.owner
    );
    config.master.version = await getHighestTag(
      config.repository,
      "master",
      config.owner
    );
  }
}

const start = async () => {
  await collectVersionInfo();
  await outputVersionInfo(configs);
};

function extractUsableSemVerFromTag(tag, repository: string, branch: string) {
  if (!semver.valid(tag.name)) {
    console.log(repository + " " + branch);
    console.log("Problem detecting version of ", tag.name);
    let tmp = tag.name.toLowerCase().replace("release-v", "");
    tmp = tmp.substr(0, 4) + "." + tmp.substr(5, 2) + "." + tmp.substr(7);
    // console.log("tmp", tmp);
    if (semver.valid(tmp)) {
      console.log(`\tusing: '${tmp}' to be semver conform.`);
      return tmp;
    }
    tmp = "0.0.0";
    console.log(`\tusing: '${tmp}' to be semver conform.`);
    return tmp;
  }
  return tag.name;
}

const getHighestTag = async (
  repository: string,
  branch: string,
  owner: string
): Promise<string> => {
  const tags = await octokit.repos.listTags({
    repo: repository,
    ref: branch,
    owner: owner,
  });

  // console.log("tags", tags);
  const allTags = tags.data.map((tag) => {
    return extractUsableSemVerFromTag(tag, repository, branch);
  });

  // console.log("allTags", repository, allTags);
  const highestVersion = compareSemver.max(allTags);
  // console.log("highestVersion", repository, highestVersion);

  return highestVersion ? highestVersion : "unknown";
};

// noinspection JSUnusedLocalSymbols
const getContent = async (
  filename: string,
  repository: string,
  branch: string,
  owner: string
): Promise<string> => {
  const content = await octokit.repos.getContents({
    repo: repository,
    ref: branch,
    path: filename,
    owner: owner,
  });
  // console.log("content", content);
  // console.log("fileContent", Buffer.from(fileContent, "base64").toString());
  // console.log("sha", content.data["sha"]);

  //TODO add error handling
  const fileContent = content.data["content"];
  return Buffer.from(fileContent, "base64").toString();
};

start().catch(console.error);
