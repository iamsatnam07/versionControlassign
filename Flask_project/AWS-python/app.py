import boto3

s3 = boto3.client('s3')

response = s3.list_buckets()
for bucket in response['Buckets']:
    print(bucket['Name'])

# client = boto3.client('ssm',region_name='ap-south-1')

# response = client.get_parameter(
#     Name='param-custom',
#     WithDecryption=True
# )

# print(response['parameter']['value'])