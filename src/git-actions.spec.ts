import { GitActions } from './git-actions';

function commonTest(inputVersion: string, versionToTestAgainst: string) {
  let gitActions = new GitActions();
  let repository: string = 'my-nice-repo';
  let branch: string = 'development';

  let tag: { name: string } = { name: inputVersion };
  let version = (gitActions as any).extractUsableSemVerFromTag(
    tag,
    repository,
    branch,
  );
  expect(version).toBeDefined();
  expect(version).toBe(versionToTestAgainst);
}

test('extractUsableSemVerFromTag should return valid semver: short normal version ', () => {
  commonTest('1.2.3', '1.2.3');
});

test('extractUsableSemVerFromTag should return valid semver: short normal vVersion ', () => {
  commonTest('v1.2.3', 'v1.2.3');
});

test('extractUsableSemVerFromTag should return valid semver: long release-vTimestamp ', () => {
  // commonTest('release-v20200405111312', '2020.4.5111312');
  // commonTest('release-v20201112111312', '2020.11.12111312');
  commonTest('release-v0.4.2', '0.4.2');
});
