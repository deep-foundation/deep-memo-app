import { Card, CardHeader, Heading, CardBody, FormControl, FormLabel, Input, Button, useToast } from "@chakra-ui/react";
import { useState } from "react";

export function Login(arg: { onSubmit: (arg: { gqlPath: string, token: string }) => void }) {
  const toast = useToast();
  const [gqlPath, setGqlPath] = useState<string|undefined>(undefined);
  const [token, setToken] = useState<string|undefined>(undefined);
  return <Card>
    <CardHeader>
      <Heading>
        Login
      </Heading>
    </CardHeader>
    <CardBody>
      <FormControl id="gql-path">
        <FormLabel>GraphQL Path</FormLabel>
        <Input type="text" placeholder={"3006-deepfoundation-dev.gitpod.io/gql"} onChange={(newGqlPath) => {
          setGqlPath(newGqlPath.target.value)
        }} />
      </FormControl>
      <FormControl id="token" >
        <FormLabel>Token</FormLabel>
        <Input type="text" onChange={(newToken) => {
          setToken(newToken.target.value)
        }} />
      </FormControl>
      <Button onClick={() => {
        if(!gqlPath || !token) {
          toast({
            title: "Invalid Input",
            description: "Please fill out all fields",
            status: "error",
            duration: 9000,
            isClosable: true,
          })
          return
        }
        arg.onSubmit({
          gqlPath,
          token
        })
      }}>
        Submit
      </Button>
    </CardBody>
  </Card>
}