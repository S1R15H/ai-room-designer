import os

import boto3
from botocore.exceptions import ClientError, NoCredentialsError
from dotenv import load_dotenv

load_dotenv()


def get_s3_client():
    return boto3.client(
        "s3",
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
        region_name=os.getenv("AWS_REGION"),
    )


def upload_file(file_bytes, filename):
    """
    Uploads a file to S3 and returns the filename (key) on success.
    """
    s3 = get_s3_client()
    bucket_name = os.getenv("S3_BUCKET_NAME")
    print(f"DEBUG: S3_BUCKET_NAME = '{bucket_name}'")

    try:
        s3.put_object(Bucket=bucket_name, Key=filename, Body=file_bytes)
        return filename
    except NoCredentialsError:
        print("Credentials not available")
        return None
    except Exception as e:
        print(f"Error uploading to S3: {e}")
        return None


def create_presigned_url(object_name, expiration=3600):
    """
    Generate a presigned URL to share an S3 object
    """
    s3 = get_s3_client()
    bucket_name = os.getenv("S3_BUCKET_NAME")

    try:
        response = s3.generate_presigned_url("get_object", Params={"Bucket": bucket_name, "Key": object_name}, ExpiresIn=expiration)
    except ClientError as e:
        print(f"Error generating presigned URL: {e}")
        return None

    return response
