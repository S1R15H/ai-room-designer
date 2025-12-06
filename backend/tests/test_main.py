from unittest.mock import patch

from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "AI Room Designer API is running"}


@patch("main.upload_file")
@patch("services.aws_s3.create_presigned_url")
@patch("main.app_graph")
def test_generate_room(mock_app_graph, mock_create_presigned_url, mock_upload_file):
    # Mock S3 upload
    mock_upload_file.return_value = "mock_original_key"

    # Mock Presigned URL
    mock_create_presigned_url.side_effect = lambda key: f"https://mock-s3/{key}"

    # Mock LangGraph workflow
    mock_app_graph.invoke.return_value = {
        "generated_image_url": "https://mock-s3/mock_generated_key",
        "items": [{"name": "Sofa", "price": 100, "link": "http://amazon.com"}],
    }

    # Create a mock file
    files = {"file": ("test.jpg", b"fake_image_content", "image/jpeg")}
    data = {"style": "Modern", "mood": "Cozy", "functionality": "Living", "palette": "Neutral", "clutter": "Low", "additional_prompt": "Test prompt"}

    response = client.post("/generate", files=files, data=data)

    assert response.status_code == 200
    json_response = response.json()
    assert json_response["original_url"] == "https://mock-s3/mock_original_key"
    assert json_response["generated_url"] == "https://mock-s3/mock_generated_key"
    assert len(json_response["items"]) == 1
    assert json_response["items"][0]["name"] == "Sofa"
