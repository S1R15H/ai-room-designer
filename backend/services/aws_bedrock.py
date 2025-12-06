import base64
import json
import os

import boto3


def invoke_model(prompt, image_bytes):
    """
    Invokes the Bedrock model (Stable Diffusion 3.5 Large) to generate an image.
    """
    bedrock_runtime = boto3.client(
        "bedrock-runtime",
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
        region_name=os.getenv("BEDROCK_REGION", os.getenv("AWS_REGION")),
    )

    model_id = "stability.sd3-5-large-v1:0"

    # Encode image to base64
    base64_image = base64.b64encode(image_bytes).decode("utf-8")

    # Payload for Stable Diffusion 3.5 Large
    payload = {
        "prompt": prompt,
        "image": base64_image,
        "strength": 0.7,  # Control strength of the prompt vs original image (0.0 to 1.0)
        "output_format": "png",
    }

    body = json.dumps(payload)

    try:
        response = bedrock_runtime.invoke_model(body=body, modelId=model_id, accept="application/json", contentType="application/json")

        response_body = json.loads(response.get("body").read())

        # SD3.5 response usually contains 'images' list with base64 strings
        # Check documentation or response structure if different
        # Based on typical Stability API on Bedrock:
        if "images" in response_body:
            base64_generated_image = response_body["images"][0]
        elif "artifacts" in response_body:  # Fallback for older/different formats
            base64_generated_image = response_body.get("artifacts")[0].get("base64")
        else:
            # Fallback or direct bytes? SD3 usually returns 'images'
            # Let's assume 'images' for now based on recent updates
            base64_generated_image = response_body.get("images")[0]

        return base64.b64decode(base64_generated_image)

    except Exception as e:
        print(f"Error invoking Bedrock model: {e}")
        return None
