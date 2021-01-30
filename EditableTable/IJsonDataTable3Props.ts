export interface IJsonDataTable3Props {
    titles: string[];
    data: string;
    onDataChanged: (data: string) => void;
    mode: 'view' | 'edit';
  }