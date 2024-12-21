# Drata CDK Stack Set

A CDK construct derived from Drata's official template at
https://github.com/drata/aws-cloudformation-drata-setup

## Installation

```bash
npm i --save-dev @factbird/drata-cdk-stackset
```

## Usage

```typescript
import { App, Stack } from 'aws-cdk-lib';
import { DeploymentType, StackSet, StackSetTarget, StackSetTemplate } from 'cdk-stacksets';
import { DrataStackSet } from '@factbird/drata-cdk-stackset';

const app = new App();
const stack = new Stack(app, 'drata');

const drataStackSet = new DrataStackSet(stack, 'DrataStack');

new StackSet(stack, 'StackSet', {
  target: StackSetTarget.fromOrganizationalUnits({
    regions: ['us-east-1'],
    organizationalUnits: ['ou-1111111', 'ou-drata'],
    parameterOverrides: {
      externalId: '1234567890',
    },
  }),
  deploymentType: DeploymentType.serviceManaged(),
  template: StackSetTemplate.fromStackSetStack(drataStackSet),
  capabilities: [Capability.NAMED_IAM],
});
```

then simply deploy the StackSet to a dedicated Drata AWS account with:

```typescript
npx cdk deploy
```

Since setting the `AccountFilterType` deployment target property to `UNION` is
not supported for StackSet creation, create a dedicated organizational unit for
a Drata account to deploy the autopilot role to it and all other OUs of
interest.

## Contributing

Install Nix and enter the development shell,

```bash
nix develop --impure
```

or simply `direnv allow` if you have direnv installed.

## Publish

There's a publish script available in the shell environment. Simply run:

```bash
publish
```
