from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient

from main import app


@pytest.fixture
def client():
    with patch("main.MongoClient"), patch("main.MongoDBSaver"), patch("main.get_app_graph"):
        with TestClient(app) as c:
            yield c


def test_read_root(client):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "AI Room Designer API is running"}


@patch("main.upload_file")
@patch("main.create_presigned_url")
def test_generate_room(mock_create_presigned_url, mock_upload_file, client):
    # Mock S3 upload
    mock_upload_file.return_value = "mock_original_key"

    # Mock Presigned URL
    mock_create_presigned_url.side_effect = lambda key: f"https://mock-s3/{key}"

    # Mock Graph Logic (stored in app.state)
    mock_graph = MagicMock()
    mock_graph.invoke.return_value = {
        "generated_image_url": "https://mock-s3/mock_generated_key",
        "items": [{"name": "Sofa", "price": 100, "link": "http://amazon.com"}],
    }

    # Let's patch imports used in lifespan to avoid real DB connection
    with patch("main.MongoClient"), patch("main.MongoDBSaver"), patch("main.get_app_graph", return_value=mock_graph):
        # We need a new client here to trigger lifespan with mocks
        with TestClient(app) as test_client:
            # Create a mock file
            files = {"file": ("test.jpg", b"fake_image_content", "image/jpeg")}
            data = {
                "style": "Modern",
                "mood": "Cozy",
                "functionality": "Living",
                "palette": "Neutral",
                "clutter": "Low",
                "additional_prompt": "Test prompt",
                "thread_id": "test-thread-123",
            }

            response = test_client.post("/generate", files=files, data=data)

            assert response.status_code == 200
            json_response = response.json()
            assert json_response["original_url"] == "https://mock-s3/mock_original_key"
            assert json_response["generated_url"] == "https://mock-s3/mock_generated_key"
            assert len(json_response["items"]) == 1
            assert json_response["items"][0]["name"] == "Sofa"
            assert json_response["thread_id"] == "test-thread-123"


def test_get_session_history(client):
    # Mock Graph Logic
    mock_graph = MagicMock()
    # Mock snapshot object
    mock_snapshot = MagicMock()
    mock_snapshot.values = {
        "generated_image_url": "https://mock-s3/history_image",
        "items": [{"name": "Lamp", "price": 50}],
    }
    mock_graph.get_state.return_value = mock_snapshot

    with patch("main.MongoClient"), patch("main.MongoDBSaver"), patch("main.get_app_graph", return_value=mock_graph):
        with TestClient(app) as test_client:
            response = test_client.get("/session/history-thread-1")

            assert response.status_code == 200
            json_response = response.json()
            assert json_response["generated_url"] == "https://mock-s3/history_image"
            assert json_response["items"][0]["name"] == "Lamp"

            # Verify get_state was called with correct config
            mock_graph.get_state.assert_called_with({"configurable": {"thread_id": "history-thread-1"}})
