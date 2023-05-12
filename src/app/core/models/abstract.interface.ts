export interface Abstract {
  id: number;
  // eslint-disable-next-line id-blacklist
  number: string;
  reference: string;
  title: string;
  formatedAuthors: string;
  introduction: string;
  patientsMethods: string;
  results: string;
  discussion: string;
  conclusion: string;
  informationSup: string;
  bibliography: string;
  keywords: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  GUID: string;
  authors: string;
  informationSup2: string;
  objectives: string;
  observation: string;
  presenter: string;
  type: string;
  theme: string;
  genre: string;
  specialty: string;
  idSession: string | null;
  idDateSession: string | null;
}
