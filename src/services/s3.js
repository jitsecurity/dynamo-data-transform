const {
  S3Client, PutObjectCommand, GetObjectCommand,
} = require('@aws-sdk/client-s3');

const getS3Client = () => {
  let s3Client;
  if (process.env.AWS_CUSTOM_ENDPOINT) {
    s3Client = new S3Client({
      endpoint: process.env.AWS_CUSTOM_ENDPOINT,
      forcePathStyle: true,
    });
  } else {
    s3Client = new S3Client();
  }
  return s3Client;
};

const uploadDataToS3Bucket = async (filePath, body) => {
  try {
    if (!body) {
      throw new Error(`Empty body for preparation data is not allowed.
      Please fix "prepare" function and make sure you return a valid object.`);
    }
    const s3Client = getS3Client();
    const command = new PutObjectCommand({
      Bucket: process.env.PREPARATION_DATA_BUCKET || 'transformations-preparation-data',
      Key: filePath,
      Body: body,
      ServerSideEncryption: 'AES256',
      ACL: 'private',
      ContentType: 'application/json',
    });

    const dataUpload = await s3Client.send(command);
    return dataUpload;
  } catch (error) {
    console.error('Error uploading data to S3 bucket', error.message);
    throw error;
  }
};

const getS3ObjectPromisified = (Bucket, Key) => {
  const s3Client = getS3Client();

  return new Promise((resolve, reject) => {
    const getObjectCommand = new GetObjectCommand({ Bucket, Key });

    s3Client.send(getObjectCommand).then((data) => {
      const responseDataChunks = [];
      const body = data.Body;
      body.once('error', (err) => reject(err));

      body.on('data', (chunk) => responseDataChunks.push(chunk));

      body.once('end', () => resolve(responseDataChunks.join('')));
    }).catch((error) => {
      reject(error);
    });
  });
};

const getDataFromS3Bucket = async (filePath) => {
  try {
    const content = await getS3ObjectPromisified(
      process.env.PREPARATION_DATA_BUCKET || 'transformations-preparation-data',
      filePath,
    );
    if (!content) {
      throw new Error(`Received empty body for preparation data.
      Please rerun prepare script and make sure you return a valid object.`);
    }
    return content;
  } catch (error) {
    console.error(`Error getting data for path: 
      '${filePath}' from S3 bucket: 
      ${process.env.PREPARATION_DATA_BUCKET} \n`, error.message);
    throw error;
  }
};

module.exports = {
  uploadDataToS3Bucket,
  getDataFromS3Bucket,
};
