from typing import TypedDict, List, Optional
from langgraph.graph import StateGraph, END
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_aws import ChatBedrock
from services.aws_bedrock import invoke_model
from services.aws_s3 import upload_file
import json
import os

# Define the State
class RoomDesignState(TypedDict):
    # Inputs
    original_image_bytes: bytes
    original_filename: str
    style: str
    mood: str
    functionality: str
    palette: str
    clutter: str
    additional_prompt: str
    
    # Outputs
    generated_prompt: str
    generated_image_bytes: Optional[bytes]
    generated_image_url: Optional[str]
    original_image_url: Optional[str]
    items: List[dict] # List of {name: str, link: str}

# Node 1: Prompt Builder
def build_prompt(state: RoomDesignState):
    print("--- Building Prompt ---")
    
    # Construct the prompt based on user inputs
    prompt_parts = []
    
    # Style Mapping
    style_map = {
        "Modern Minimalist": "Modern Minimalist style, clean lines, neutral colors, less clutter, sleek furniture.",
        "Industrial Loft": "Industrial Loft style, exposed brick, metal accents, raw wood, urban aesthetic.",
        "Scandinavian / Hygge": "Scandinavian Hygge style, cozy, white and wood, soft textures, functional, warm lighting.",
        "Cyberpunk / Futuristic": "Cyberpunk style, neon LED lighting, futuristic furniture, metallic surfaces, night time atmosphere, high-tech.",
        "Bohemian": "Bohemian style, plants, patterns, rattan, eclectic, warm colors, layered textures.",
        "Mid-Century Modern": "Mid-Century Modern style, retro 50s/60s, organic shapes, vibrant accents, teak wood.",
        "Japandi": "Japandi style, blend of Japanese rustic and Scandinavian functionalism, natural materials, balanced."
    }
    if state["style"] in style_map:
        prompt_parts.append(style_map[state["style"]])
    
    # Mood Mapping
    mood_map = {
        "Calm & Zen": "Calm and Zen atmosphere, soft lighting, uncluttered, peaceful, serene.",
        "Energetic & Creative": "Energetic and Creative atmosphere, bright natural light, bold colors, inspiring.",
        "Moody & Dramatic": "Moody and Dramatic atmosphere, cinematic lighting, chiaroscuro, shadows, dark tones.",
        "Professional & Focused": "Professional and Focused atmosphere, cool lighting, organized, sharp contrast, office vibe.",
        "Cozy & Warm": "Cozy and Warm atmosphere, warm lighting, blankets, soft shadows, inviting.",
        "Luxury & Elegant": "Luxury and Elegant atmosphere, gold accents, marble, expensive textures, high-end."
    }
    if state["mood"] in mood_map:
        prompt_parts.append(mood_map[state["mood"]])
        
    # Functionality Mapping
    func_map = {
        "Deep Focus / Work": "Home office setup, desk, ergonomic chair, bookshelf, organized workspace.",
        "Relaxation / Lounge": "Living room setup, comfortable sofa, coffee table, TV, relaxation area.",
        "Gaming / Streaming": "High-end gaming setup, triple monitor display, RGB ambient lighting, ergonomic gaming chair, soundproofing panels.",
        "Creative Studio": "Creative studio setup, large table, storage, art supplies, easel, instruments.",
        "Sleeping / Rest": "Bedroom setup, comfortable bed, nightstands, wardrobe, restful environment."
    }
    if state["functionality"] in func_map:
        prompt_parts.append(func_map[state["functionality"]])
        
    # Palette Mapping
    palette_map = {
        "Earth Tones": "Earth Tones color palette, Beige, Olive, Terracotta, Brown.",
        "Monochrome": "Monochrome color palette, Black, White, Grey.",
        "Pastel": "Pastel color palette, Soft Pink, Mint Green, Baby Blue.",
        "Dark & Bold": "Dark and Bold color palette, Navy Blue, Emerald Green, Charcoal.",
        "Warm Neutrals": "Warm Neutrals color palette, Cream, Taupe, Sand.",
        "Cool Blues": "Cool Blues color palette, Teal, Slate, Sky Blue."
    }
    if state["palette"] in palette_map:
        prompt_parts.append(palette_map[state["palette"]])
        
    # Clutter Mapping
    clutter_map = {
        "Showroom Perfect": "Minimalist, clean surfaces, architectural digest style, pristine, no clutter.",
        "Organized but Lived-in": "Organized but lived-in, a few books out, coffee cup, throw blanket, realistic.",
        "Maximalist / Busy": "Maximalist, cluttered, highly detailed, filled with objects, lived-in, eclectic decor."
    }
    if state["clutter"] in clutter_map:
        prompt_parts.append(clutter_map[state["clutter"]])
        
    # Additional Prompt
    if state["additional_prompt"]:
        prompt_parts.append(f"Additional details: {state['additional_prompt']}")
        
    final_prompt = " ".join(prompt_parts)
    print(f"Generated Prompt: {final_prompt}")
    
    return {"generated_prompt": final_prompt}

# Node 2: Select Items (Runs BEFORE generation)
def select_items(state: RoomDesignState):
    print("--- Selecting Items ---")
    
    # Use Bedrock Claude to suggest items based on the prompt
    llm = ChatBedrock(
        model_id="us.anthropic.claude-3-5-haiku-20241022-v1:0",
        model_kwargs={"temperature": 0.5},
        region_name=os.getenv('BEDROCK_REGION', os.getenv('AWS_REGION'))
    )
    
    system_prompt = """
    You are an interior design assistant. Based on the user's design prompt, list 3-5 key furniture and decor items that SHOULD be included in the generated room design.
    Search the current market to find the average price of each item.
    Return ONLY a JSON array of objects, where each object has a 'name' field and a 'price' field.
    Example: [{"name": "Modern Grey Sofa", "price": "100"}, {"name": "Geometric Rug", "price": "50"}, {"name": "Floor Lamp", "price": "20"}]
    Do not include any other text.
    """
    
    user_message = f"Design Prompt: {state['generated_prompt']}"
    
    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=user_message)
    ]
    
    try:
        response = llm.invoke(messages)
        content = response.content
        
        # Extract JSON
        start_idx = content.find('[')
        end_idx = content.rfind(']') + 1
        if start_idx != -1 and end_idx != -1:
            json_str = content[start_idx:end_idx]
            items_data = json.loads(json_str)
            
            # Add Amazon links immediately
            final_items = []
            for item in items_data:
                item_name = item['name']
                item_price = item['price']
                search_query = item_name.replace(" ", "+")
                link = f"https://www.amazon.com/s?k={search_query}"
                final_items.append({"name": item_name, "link": link, "price": item_price})
                
            return {"items": final_items}
        else:
            print("Could not find JSON in response")
            return {"items": []}
            
    except Exception as e:
        print(f"Error selecting items: {e}")
        return {"items": []}

# Node 3: Image Generator (Uses selected items)
def generate_image_node(state: RoomDesignState):
    print("--- Generating Image ---")
    
    # Enhance prompt with selected items
    enhanced_prompt = state["generated_prompt"]
    if state.get("items"):
        item_names = [item["name"] for item in state["items"]]
        items_str = ", ".join(item_names)
        enhanced_prompt += f" The room features these key items: {items_str}."
    
    print(f"Enhanced Prompt for Generation: {enhanced_prompt}")
    
    generated_bytes = invoke_model(enhanced_prompt, state["original_image_bytes"])
    
    if not generated_bytes:
        raise Exception("Failed to generate image")
        
    # Upload generated image
    generated_filename = f"generated_{state['original_filename']}"
    generated_key = upload_file(generated_bytes, generated_filename)
    
    # Generate presigned URL
    from services.aws_s3 import create_presigned_url
    generated_url = create_presigned_url(generated_key)
    
    return {
        "generated_image_bytes": generated_bytes,
        "generated_image_url": generated_url
    }

# Build the Graph
workflow = StateGraph(RoomDesignState)

workflow.add_node("build_prompt", build_prompt)
workflow.add_node("select_items", select_items)
workflow.add_node("generate_image", generate_image_node)

workflow.set_entry_point("build_prompt")
workflow.add_edge("build_prompt", "select_items")
workflow.add_edge("select_items", "generate_image")
workflow.add_edge("generate_image", END)

app_graph = workflow.compile()
