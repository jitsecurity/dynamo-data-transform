const {
  ListKeysCommand, DescribeKeyCommand, DecryptCommand, EncryptCommand,
} = require('@aws-sdk/client-kms');

// We want to use only one key for every stage
// This is the description of the key in dev,staging,prod
// Should be replaced somewhen with appropriate alias/description
const KMS_KEY_DESCRIPTION = 'key for TF infra';

const getMigrationsKMSKey = async (kms) => {
  let migrationsKmsKeyId = null;

  try {
    const { Keys } = await kms.send(new ListKeysCommand({}));
    await Promise.all(Keys.map(async (key) => {
      const { KeyMetadata } = await kms.send(new DescribeKeyCommand({ KeyId: key.KeyId }));
      const { KeyId, Description } = KeyMetadata;
      if (!migrationsKmsKeyId) {
        migrationsKmsKeyId = Description === KMS_KEY_DESCRIPTION ? KeyId : null;
      }
    }));
  } catch (error) {
    console.error('Could not get migrations kms key', error);
    throw error;
  }

  if (migrationsKmsKeyId) {
    return migrationsKmsKeyId;
  }
  const errorMessage = `Could not find a kms key with description: ${KMS_KEY_DESCRIPTION}
    Run the following command to create one locally:
    awslocal kms create-key --description '${KMS_KEY_DESCRIPTION}'
    `;
  console.error(errorMessage);
  throw new Error(errorMessage);
};

const getDecryptedData = async (kms, encryptedData) => {
  try {
    const migrationsKmsKeyId = await getMigrationsKMSKey(kms);
    const { Plaintext } = await kms.send(new DecryptCommand({
      CiphertextBlob: encryptedData,
      KeyId: migrationsKmsKeyId,
      EncryptionAlgorithm: 'SYMMETRIC_DEFAULT',
    }));

    const decryptedData = JSON.parse((new TextDecoder()).decode(Plaintext));
    return decryptedData;
  } catch (error) {
    console.error('Could not get decrypted data', error);
    throw error;
  }
};

const getEncryptedData = async (kms, data) => {
  try {
    const migrationsKmsKeyId = await getMigrationsKMSKey(kms);

    const encryptCommand = new EncryptCommand({
      KeyId: migrationsKmsKeyId,
      Plaintext: Buffer.from(JSON.stringify(data)),
      EncryptionAlgorithm: 'SYMMETRIC_DEFAULT',
    });
    const { CiphertextBlob } = await kms.send(encryptCommand);
    return CiphertextBlob;
  } catch (error) {
    console.error('Could not get encrypted data for:', data, error);
    throw error;
  }
};

module.exports = {
  getMigrationsKMSKey,
  getDecryptedData,
  getEncryptedData,
};
