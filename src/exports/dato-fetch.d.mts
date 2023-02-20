type Options = {
  headers: DatocmsHeaderOptions;
  env?: string;
  vars?: GraphqlVarOptions;
  paginatedFieldName?: string;
  disableState?: boolean;
}

type DatocmsHeaderOptions = {
  [key: string]: string;
  Authorization: string;
}

type GraphqlVarOptions = {
  [key: string]: string | number | boolean;
}

export default function datoFetch(query: string, options: Options): Promise<unknown>;
