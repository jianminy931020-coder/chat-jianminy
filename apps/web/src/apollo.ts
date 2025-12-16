import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

export const apollo = new ApolloClient({
  link: new HttpLink({ uri: import.meta.env.VITE_GRAPHQL_ENDPOINT }),
  cache: new InMemoryCache(),
});
