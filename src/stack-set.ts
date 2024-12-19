import { Duration } from 'aws-cdk-lib';
import { AccountPrincipal, ManagedPolicy, PolicyStatement, Role } from 'aws-cdk-lib/aws-iam';
import { StackSetStack, type StackSetStackProps } from 'cdk-stacksets';
import type { Construct } from 'constructs';

const defaultAccountId = '269135526815';

type DrataProperties = {
  // Details provided by Drata
  drata: {
    accountId?: string;
    externalId: string;
  };
};

export class DrataStackSet extends StackSetStack {
  constructor(scope: Construct, id: string, { drata, ...props }: StackSetStackProps & DrataProperties) {
    super(scope, id, props);

    const { accountId = defaultAccountId, externalId } = drata;

    const drataRole = new Role(scope, 'drata-role', {
      assumedBy: new AccountPrincipal(accountId).withConditions({
        StringEquals: { 'sts:ExternalId': externalId },
      }),
      managedPolicies: [ManagedPolicy.fromAwsManagedPolicyName('SecurityAudit')],
      maxSessionDuration: Duration.hours(12),
      roleName: 'DrataAutopiloRole',
      description: 'Cross-account read-only access for Drata Autopilot',
    });

    drataRole.addToPolicy(
      new PolicyStatement({
        resources: ['*'],
        actions: ['backup:ListBackupJobs', 'backup:ListRecoveryPointsByResource'],
      }),
    );
  }
}
