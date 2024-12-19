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
import { StackSet, StackSetTarget, StackSetTemplate } from 'cdk-stacksets';
import { DrataStackSet } from '@factbird/drata-cdk-stackset';

const app = new App();
const stack = new Stack(app);

const drataStackSet = new DrataStackSet(stack, 'DrataStack');

new StackSet(stack, 'StackSet', {
  target: StackSetTarget.fromOrganizationalUnits({
    regions: ['us-east-1'],
    organizationalUnits: ['ou-1111111'],
    parameterOverrides: {
      externalID: '1234567890',
    },
  }),
  template: StackSetTemplate.fromStackSetStack(drataStackSet),
});
```

## Contributing

Install Nix and enter the development shell,

> [!IMPORTANT]
>
> ```bash
> nix develop --impure
> ```

or simply `direnv allow` if you have direnv installed.

## Publish

There's a publish script available in the shell environment. Simply run:

```bash
publish
```
