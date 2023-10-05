import { useGraphQlUrl } from "../hooks/use-gql-path";

export function WithGraphQlUrl(options: WithGraphQlUrlOptions) {
  const [graphQlUrl, setGraphQlUrl, unsertGraphQlUrl, isLoading] = useGraphQlUrl();
  if(isLoading) {
    return options.renderIfLoading()
  } else {
    return options.renderChildren({
      graphQlUrl,
      setGraphQlUrl
    });
  }
  
}

export interface WithGraphQlUrlOptions {
  renderChildren: (param: { graphQlUrl: string|undefined, setGraphQlUrl: (newGraphQl: string) => void }) => JSX.Element;
  renderIfLoading: () => JSX.Element;
}