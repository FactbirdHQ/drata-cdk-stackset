# Drata CDK Stack Set

A CDK construct derived from Drata's official template at
https://github.com/drata/aws-cloudformation-drata-setup

## Installation

```bash
npm i --save-dev @factbird/drata-cdk-stackset
```

## Usage

This setup assumes the following account structure:
1. An isolated Drata account that is trusted as a delegated administrator account
2. Management (with AWSCloudFormationStackSetExecutionRole available that trusts the isolated Drata account)
3. Target accounts

Service-managed StackSets will not deploy to the management account hence why a
self-managed variant is necessary. Similarly, a StackSet `UNION` deployment
target filter is not supported for creation events.

Both 1. and 2. are deployed as self-managed stacksets and 3. is deployed as a
service-managed stack such that new accounts added to the OUs are populated
automatically.

If 2. does not have an execution role already, you can deploy that separately - otherwise skip this step and instead extend its trust policy for your Drata account:

```typescript
import { App, Stack } from 'aws-cdk-lib';
import { AccountPrincipal, ManagedPolicy, Role } from 'aws-cdk-lib/aws-iam';

const yourAccounts = {
  drata: '987654321',
  management: '1234567890',
};

const app = new App();

const stack = new Stack(app, 'stackset-execution', {
  env: {
    account: yourAccounts.management,
  },
});

new Role(stack, 'StackSetExecutionRole', {
  roleName: 'AWSCloudFormationStackSetExecutionRole',
  managedPolicies: [ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess')],
  assumedBy: new AccountPrincipal(yourAccounts.drata),
});
```

For the Drata related resources, both variants of the StackSets can be created like so:
```typescript
import { App, Stack } from 'aws-cdk-lib';
import { DeploymentType, StackSet, StackSetTarget, StackSetTemplate } from 'cdk-stacksets';
import { DrataStackSet } from '@factbird/drata-cdk-stackset';

const organizationalUnits = {
  targetAccounts: 'ou-1234567',
};

const yourAccounts = {
  drata: '987654321',
  management: '1234567890',
};

const externalId = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';

const app = new App();

const stack = new Stack(app, 'drata', {
  env: {
    account: yourAccounts.drata,
  },
});

// The Drata account itself needs to execute the StackSets as a self-managed
// variant
new Role(stack, 'StackSetExecutionRole', {
  roleName: 'AWSCloudFormationStackSetExecutionRole',
  managedPolicies: [ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess')],
  assumedBy: new AccountPrincipal(yourAccounts.drata),
});


const drataStackSet = new DrataStackSet(stack, 'DrataStack');

const serviceManaged = new StackSet(stack, 'drata-service-managed', {
  target: StackSetTarget.fromOrganizationalUnits({
    regions: ['us-east-1'],
    organizationalUnits: Object.values(organizationalUnits),
    parameterOverrides: {
      externalId,
    },
  }),
  deploymentType: DeploymentType.serviceManaged(),
  template: StackSetTemplate.fromStackSetStack(drataStackSet),
  capabilities: [Capability.NAMED_IAM],
});

const selfManaged = new StackSet(stack, 'drata-self-managed', {
  target: StackSetTarget.fromAccounts({
    regions: ['us-east-1'],
    accounts: [yourAccounts.management, yourAccounts.drata],
    parameterOverrides: {
      externalId,
    },
  }),
  template: StackSetTemplate.fromStackSetStack(drataStackSet),
  capabilities: [Capability.NAMED_IAM],
});

// Consider if the following two workarounds are still necessary:

// See https://github.com/cdklabs/cdk-stacksets/pull/678
if (selfManaged.role) {
  selfManaged.node.addDependency(selfManaged.role);
}

// See https://github.com/cdklabs/cdk-stacksets/issues/115
for (const stackSet of [serviceManaged, selfManaged]) {
  const cfnStackSet = stackSet.node.defaultChild as CfnStackSet;
  cfnStackSet.addOverride('Properties.Parameters', [
    {
      ParameterKey: 'externalId',
      ParameterValue: '',
    },
  ]);
}
```

then simply deploy the StackSets to a dedicated Drata AWS account with:

```typescript
npx cdk deploy
```

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
