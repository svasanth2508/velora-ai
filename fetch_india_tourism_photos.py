import urllib.request
import json
import time

# List of all 28 States and 8 Union Territories with Wikipedia article formatted names
entities = [
    # --- 28 STATES ---
    {"name": "Andhra Pradesh", "wiki_title": "Andhra_Pradesh", "type": "State"},
    {"name": "Arunachal Pradesh", "wiki_title": "Arunachal_Pradesh", "type": "State"},
    {"name": "Assam", "wiki_title": "Assam", "type": "State"},
    {"name": "Bihar", "wiki_title": "Bihar", "type": "State"},
    {"name": "Chhattisgarh", "wiki_title": "Chhattisgarh", "type": "State"},
    {"name": "Goa", "wiki_title": "Goa", "type": "State"},
    {"name": "Gujarat", "wiki_title": "Gujarat", "type": "State"},
    {"name": "Haryana", "wiki_title": "Haryana", "type": "State"},
    {"name": "Himachal Pradesh", "wiki_title": "Himachal_Pradesh", "type": "State"},
    {"name": "Jharkhand", "wiki_title": "Jharkhand", "type": "State"},
    {"name": "Karnataka", "wiki_title": "Karnataka", "type": "State"},
    {"name": "Kerala", "wiki_title": "Kerala", "type": "State"},
    {"name": "Madhya Pradesh", "wiki_title": "Madhya_Pradesh", "type": "State"},
    {"name": "Maharashtra", "wiki_title": "Maharashtra", "type": "State"},
    {"name": "Manipur", "wiki_title": "Manipur", "type": "State"},
    {"name": "Meghalaya", "wiki_title": "Meghalaya", "type": "State"},
    {"name": "Mizoram", "wiki_title": "Mizoram", "type": "State"},
    {"name": "Nagaland", "wiki_title": "Nagaland", "type": "State"},
    {"name": "Odisha", "wiki_title": "Odisha", "type": "State"},
    {"name": "Punjab", "wiki_title": "Punjab,_India", "type": "State"},
    {"name": "Rajasthan", "wiki_title": "Rajasthan", "type": "State"},
    {"name": "Sikkim", "wiki_title": "Sikkim", "type": "State"},
    {"name": "Tamil Nadu", "wiki_title": "Tamil_Nadu", "type": "State"},
    {"name": "Telangana", "wiki_title": "Telangana", "type": "State"},
    {"name": "Tripura", "wiki_title": "Tripura", "type": "State"},
    {"name": "Uttar Pradesh", "wiki_title": "Uttar_Pradesh", "type": "State"},
    {"name": "Uttarakhand", "wiki_title": "Uttarakhand", "type": "State"},
    {"name": "West Bengal", "wiki_title": "West_Bengal", "type": "State"},

    # --- 8 UNION TERRITORIES ---
    {"name": "Andaman and Nicobar Islands", "wiki_title": "Andaman_and_Nicobar_Islands", "type": "Union Territory"},
    {"name": "Chandigarh", "wiki_title": "Chandigarh", "type": "Union Territory"},
    {"name": "Dadra and Nagar Haveli and Daman and Diu", "wiki_title": "Dadra_and_Nagar_Haveli_and_Daman_and_Diu", "type": "Union Territory"},
    {"name": "Delhi", "wiki_title": "Delhi", "type": "Union Territory"},
    {"name": "Jammu and Kashmir", "wiki_title": "Jammu_and_Kashmir_(union_territory)", "type": "Union Territory"},
    {"name": "Ladakh", "wiki_title": "Ladakh", "type": "Union Territory"},
    {"name": "Lakshadweep", "wiki_title": "Lakshadweep", "type": "Union Territory"},
    {"name": "Puducherry", "wiki_title": "Puducherry", "type": "Union Territory"}
]

# Wikimedia API requires a custom User-Agent header
headers = {
    'User-Agent': 'TourismAppPhotoFetcher/1.0 (contact@yourtourismdomain.com)'
}

updated_dataset = []
print("Fetching high-resolution photo URLs and metadata from Wikimedia API...")

for item in entities:
    url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{item['wiki_title']}"
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            if response.status == 200:
                data = json.loads(response.read().decode('utf-8'))
                
                # Prioritize high-resolution originalimage over thumbnail
                original_obj = data.get("originalimage", {})
                thumb_obj = data.get("thumbnail", {})
                
                original_photo = original_obj.get("source", "")
                thumbnail_photo = thumb_obj.get("source", "")
                description = data.get("description", "") or data.get("extract", "")
                
                # Construct highest quality variant image URL
                high_res_photo = original_photo if original_photo else thumbnail_photo
                
                # If thumbnail is available and original isn't, construct full-size URL from thumbnail
                if not original_photo and thumbnail_photo:
                    if "/thumb/" in thumbnail_photo:
                        high_res_photo = thumbnail_photo.rsplit("/", 1)[0].replace("/thumb/", "/")
                
                item["photo_url"] = high_res_photo
                item["high_res_photo_url"] = high_res_photo
                item["thumbnail_url"] = thumbnail_photo
                item["short_description"] = description
                item["image_credit"] = f"Wikimedia Commons / Wikipedia ({data.get('title', item['name'])})"
                
                print(f"✓ {item['name']}: High-res Photo URL retrieved successfully.")
            else:
                print(f"✗ Failed for {item['name']}: HTTP {response.status}")
                item["photo_url"] = None
                item["high_res_photo_url"] = None
                item["thumbnail_url"] = None
                item["short_description"] = ""
                item["image_credit"] = "Wikimedia Commons"
    except Exception as e:
        print(f"Error fetching {item['name']}: {e}")
        item["photo_url"] = None
        item["high_res_photo_url"] = None
        item["thumbnail_url"] = None
        item["short_description"] = ""
        item["image_credit"] = "Wikimedia Commons"
        
    updated_dataset.append(item)
    time.sleep(0.05)  # Respectful delay between requests

# Save the updated dataset with live photos and image credits into JSON file
with open("india_tourism_data.json", "w", encoding="utf-8") as f:
    json.dump(updated_dataset, f, indent=4, ensure_ascii=False)

print("\nFinished! Saved updated photos dataset with image credits to 'india_tourism_data.json'.")
