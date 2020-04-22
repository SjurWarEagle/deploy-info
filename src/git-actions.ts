import { Octokit } from '@octokit/rest';
import * as compareSemver from 'compare-semver';
import * as semver from 'semver';

export class GitActions {
  private readonly octokit = new Octokit({
  	auth: process.env.GITHUB_TOKEN,
  	userAgent: 'version-info v0.1',
  });

  // noinspection JSUnusedLocalSymbols
  public async getContent(
  	filename: string,
  	repository: string,
  	branch: string,
  	owner: string
  ): Promise<string> {
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
  	const content = await this.octokit.repos.getContents({
  		repo: repository,
  		ref: branch,
  		path: filename,
  		owner: owner,
  	});
  	// console.log("content", content);
  	// console.log("fileContent", Buffer.from(fileContent, "base64").toString());
  	// console.log("sha", content.data["sha"]);

  	//TODO add error handling
  	const fileContent = content.data['content'];
  	return Buffer.from(fileContent, 'base64').toString();
  }

  public async getLastCommitDate(
  	repository: string,
  	branch: string,
  	owner: string
  ): Promise<string> {
  	const latestCommit = await this.octokit.repos.getCommit({
  		repo: repository,
  		ref: branch,
  		owner: owner,
  	});
  	// console.log("latestCommit", latestCommit.data.sha);

  	const commitContent = await this.octokit.git.getCommit({
  		commit_sha: latestCommit.data.sha,
  		repo: repository,
  		owner: owner,
  	});
  	// console.log("commitContent", commitContent.data.author.date);

  	return commitContent.data.author.date;
  }

  public async getHighestTag(
  	repository: string,
  	branch: string,
  	owner: string
  ): Promise<string> {
  	const tags = await this.octokit.repos.listTags({
  		repo: repository,
  		ref: branch,
  		owner: owner,
  	});

  	// console.log("tags", tags);
  	const allTags = tags.data.map((tag) => {
  		return this.extractUsableSemVerFromTag(tag, repository, branch);
  	});

  	// console.log("allTags", repository, allTags);
  	const highestVersion = compareSemver.max(allTags);
  	// console.log("highestVersion", repository, highestVersion);

  	return highestVersion ? highestVersion : 'unknown';
  }

  private extractUsableSemVerFromTag(tag, repository: string, branch: string) {
  	if (!semver.valid(tag.name)) {
  		console.log(repository + ' ' + branch);
  		console.log('Problem detecting version of ', tag.name);
  		let tmp = tag.name.toLowerCase().replace('release-v', '');
  		tmp = tmp.substr(0, 4) + '.' + tmp.substr(5, 2) + '.' + tmp.substr(7);
  		// console.log("tmp", tmp);
  		if (semver.valid(tmp)) {
  			console.log(`\tusing: '${tmp}' to be semver conform.`);
  			return tmp;
  		}
  		tmp = '0.0.0';
  		console.log(`\tusing: '${tmp}' to be semver conform.`);
  		return tmp;
  	}
  	return tag.name;
  }
}
