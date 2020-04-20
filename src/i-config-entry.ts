export interface IConfigEntry {
  repository: string;
  fileName: string;
  owner: string;
  type: "NODE" | "JAVA";
  master?: {
    version: string;
    lastCommitDate: string;
  };
  develop?: {
    version: string;
    lastCommitDate: string;
  };
}
