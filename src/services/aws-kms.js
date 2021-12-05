// We want to use only one key for every stage
// This is the description of the key in dev,staging,prod
// Should be replaced somewhen with appropriate alias/description
const KMS_KEY_DESCRIPTION = 'key for TF infra'

const getMigrationsKMSKey = async (kms) => {
    let migrationsKmsKeyId = null

    try {
        const { Keys } = await kms.listKeys().promise()
        await Promise.all(Keys.map(async (key) => {
            const { KeyMetadata } = await kms.describeKey({ KeyId: key.KeyId }).promise()
            const { KeyId, Description } = KeyMetadata
            if (!migrationsKmsKeyId) {
                migrationsKmsKeyId = Description === KMS_KEY_DESCRIPTION ? KeyId : null
            }
        }))

    } catch (error) {
        console.error('Could not get migrations kms key')
        throw error
    }

    if (migrationsKmsKeyId) {
        return migrationsKmsKeyId
    } else {
        const errorMessage = `Could not find a kms key with description: ${KMS_KEY_DESCRIPTION}
    Run the following command to create one locally:
    awslocal kms create-key --description '${KMS_KEY_DESCRIPTION}'
    `
        console.error(errorMessage)
        throw new Error(errorMessage)
    }
}

const getDecryptedData = async (kms, encryptedData) => {
    try {
        const migrationsKmsKeyId = await getMigrationsKMSKey(kms)
        const { Plaintext } = await kms.decrypt({
            CiphertextBlob: encryptedData,
            KeyId: migrationsKmsKeyId,
            EncryptionAlgorithm: 'SYMMETRIC_DEFAULT',
        }).promise()

        const decryptedData = JSON.parse(Plaintext.toString('utf8'))
        console.log(decryptedData, 'decrypted')

        return decryptedData
    } catch (error) {
        console.error(`Could not get decrypted data`, error)
        throw error
    }

}

const getEncryptedData = async (kms, data) => {
    try {
        const migrationsKmsKeyId = await getMigrationsKMSKey(kms)

        var params = {
            KeyId: migrationsKmsKeyId,
            Plaintext: Buffer.from(JSON.stringify(data)),
            EncryptionAlgorithm: 'SYMMETRIC_DEFAULT',
        };
        const { CiphertextBlob } = await kms.encrypt(params).promise()
        return CiphertextBlob
    } catch (error) {
        console.error(`Could not get encrypted data for:`, data, error)
        throw error
    }

}

module.exports = {
    getMigrationsKMSKey,
    getDecryptedData,
    getEncryptedData
}