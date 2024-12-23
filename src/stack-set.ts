import { CfnParameter, Duration } from 'aws-cdk-lib';
import { AccountPrincipal, ManagedPolicy, PolicyStatement, Role } from 'aws-cdk-lib/aws-iam';
import { StackSetStack, type StackSetStackProps } from 'cdk-stacksets';
import type { Construct } from 'constructs';

const defaultAccountId = '269135526815';

export class DrataStackSet extends StackSetStack {
  constructor(scope: Construct, id: string, props?: StackSetStackProps) {
    super(scope, id, props);

    const accountId = new CfnParameter(this, 'drataAWSAccountId', {
      type: 'String',
      description: "Drata's AWS account ID.",
      default: defaultAccountId,
      allowedPattern: '\\d{12}$',
      minLength: 1,
      constraintDescription: "drataAWSAccountId should be exactly 12 digits (numeric characters). It's required.",
    });

    const externalId = new CfnParameter(this, 'externalId', {
      type: 'String',
      description: 'STS ExternalId condition value to use with the role.',
      allowedPattern: '[a-zA-Z0-9\\=\\,\\.\\@\\:\\/\\-_]*',
      minLength: 1,
      constraintDescription: 'externalId must be an UUID formatted string and is required.',
    });

    const drataRole = new Role(this, 'DrataRole', {
      assumedBy: new AccountPrincipal(accountId.valueAsString),
      managedPolicies: [ManagedPolicy.fromAwsManagedPolicyName('SecurityAudit')],
      externalIds: [externalId.valueAsString],
      maxSessionDuration: Duration.hours(12),
      roleName: 'DrataAutopilotRole',
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
