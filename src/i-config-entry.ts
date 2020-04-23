export interface IConfigEntry {
  repository: string;
  fileName: string;
  owner: string;
  type: 'NODE' | 'JAVA';
  master?: {
    version: string;
    lastCommitDate: string;
    numberOfCommits?: number;
  };
  develop?: {
    version: string;
    lastCommitDate: string;
    numberOfCommits?: number;
  };
}
