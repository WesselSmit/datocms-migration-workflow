import { IncomingHttpHeaders } from 'node:http'

type Options = {
  headers: IncomingHttpHeaders & DatocmsHeaderOptions,
  env?: string,
  vars?: GraphqlVarOptions,
  paginatedFieldName?: string,
  disableState?: boolean,
}

type DatocmsHeaderOptions = {
  Authorization: string,
  'X-Environment'?: string,
}

type GraphqlVarOptions = {
  [key: string]: string | number | boolean,
}

type ApiResponse =
  | { data: unknown }
  | { error: Error }

export default function datoFetch(query: string, options: Options): Promise<ApiResponse>;
