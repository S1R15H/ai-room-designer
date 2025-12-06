from unittest.mock import MagicMock, patch

from graph import build_prompt, select_items


def test_build_prompt():
    state = {
        "style": "Modern Minimalist",
        "mood": "Calm & Zen",
        "functionality": "Relaxation / Lounge",
        "palette": "Monochrome",
        "clutter": "Showroom Perfect",
        "additional_prompt": "A big window",
        "generated_prompt": "",
    }

    result = build_prompt(state)
    prompt = result["generated_prompt"]

    assert "Modern Minimalist style" in prompt
    assert "Calm and Zen atmosphere" in prompt
    assert "Living room setup" in prompt
    assert "Monochrome color palette" in prompt
    assert "Minimalist, clean surfaces" in prompt
    assert "A big window" in prompt


@patch("graph.ChatBedrock")
def test_select_items(mock_chat_bedrock):
    # Mock the LLM response
    mock_llm_instance = MagicMock()
    mock_content = '[{"name": "Test Item", "price": "100"}]'
    mock_llm_instance.invoke.return_value.content = mock_content
    mock_chat_bedrock.return_value = mock_llm_instance

    state = {"generated_prompt": "Test prompt"}
    result = select_items(state)

    assert len(result["items"]) == 1
    assert result["items"][0]["name"] == "Test Item"
    assert result["items"][0]["price"] == "100"
    assert "amazon.com" in result["items"][0]["link"]
