const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');

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

const uploadDataToPrivateS3Bucket = async (filePath, body) => {
  try {
    if (!body) {
      throw new Error(`Empty body for preparation data is not allowed.
      Please fix "prepare" function and make sure you return a valid object.`);
    }
    const s3Client = getS3Client();
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME || 'migrations-preparation-data',
      Key: filePath,
      Body: body,
    });

    const dataUpload = await s3Client.send(command);
    return dataUpload;
  } catch (error) {
    console.error(`Error uploading data to S3 bucket: ${error}`);
    throw error;
  }
};

const getDataFromS3Bucket = async (filePath) => {
  try {
    const s3Client = getS3Client();
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME || 'migrations-preparation-data',
      Key: filePath,
    });

    const data = await s3Client.send(command);
    const body = await data.Body.read();
    if (!body) {
      throw new Error(`Received empty body for preparation data.
      Please rerun prepare script and make sure you return a valid object.`);
    }
    return body.toString();
  } catch (error) {
    console.error(`Error getting data for path: 
      ${filePath} from S3 bucket: 
      ${process.env.S3_BUCKET_NAME}`, error);
    throw error;
  }
};

module.exports = {
  uploadDataToPrivateS3Bucket,
  getDataFromS3Bucket,
};
