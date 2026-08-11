export interface WikiTourismEntity {
  name: string;
  wiki_title: string;
  type: string;
  photo_url?: string;
  high_res_photo_url?: string;
  thumbnail_url?: string;
  short_description?: string;
  image_credit?: string;
  greeting?: string;
  capital?: string;
  bestMonths?: string;
  famousFood?: string;
  code?: string;
}

export const WIKI_INDIAN_ENTITIES: WikiTourismEntity[] = [
  // --- 28 STATES ---
  { name: "Andhra Pradesh", wiki_title: "Andhra_Pradesh", type: "State", greeting: "Swagatham", capital: "Amaravati", bestMonths: "Oct - Mar", famousFood: "Hyderabadi Biryani & Pootharekulu", code: "AP" },
  { name: "Arunachal Pradesh", wiki_title: "Arunachal_Pradesh", type: "State", greeting: "Tashi Delek", capital: "Itanagar", bestMonths: "Oct - Apr", famousFood: "Thukpa & Bamboo Shoot", code: "AR" },
  { name: "Assam", wiki_title: "Assam", type: "State", greeting: "Nomaskar", capital: "Dispur", bestMonths: "Nov - Apr", famousFood: "Masor Tenga & Pitha", code: "AS" },
  { name: "Bihar", wiki_title: "Bihar", type: "State", greeting: "Pranam", capital: "Patna", bestMonths: "Oct - Mar", famousFood: "Litti Chokha & Anarsa", code: "BR" },
  { name: "Chhattisgarh", wiki_title: "Chhattisgarh", type: "State", greeting: "Jai Johar", capital: "Raipur", bestMonths: "Oct - Mar", famousFood: "Chila & Muthia", code: "CG" },
  { name: "Goa", wiki_title: "Goa", type: "State", greeting: "Dev Boren Korum", capital: "Panaji", bestMonths: "Nov - Feb", famousFood: "Fish Curry Rice & Bebinca", code: "GA" },
  { name: "Gujarat", wiki_title: "Gujarat", type: "State", greeting: "Kem Cho", capital: "Gandhinagar", bestMonths: "Nov - Feb", famousFood: "Dhokla & Undhiyu", code: "GJ" },
  { name: "Haryana", wiki_title: "Haryana", type: "State", greeting: "Ram Ram", capital: "Chandigarh", bestMonths: "Oct - Mar", famousFood: "Bajra Khichdi & Rabri", code: "HR" },
  { name: "Himachal Pradesh", wiki_title: "Himachal_Pradesh", type: "State", greeting: "Namaste", capital: "Shimla", bestMonths: "Mar - Jun, Sep - Dec", famousFood: "Dham & Siddu", code: "HP" },
  { name: "Jharkhand", wiki_title: "Jharkhand", type: "State", greeting: "Johar", capital: "Ranchi", bestMonths: "Oct - Mar", famousFood: "Dhuska & Pittha", code: "JH" },
  { name: "Karnataka", wiki_title: "Karnataka", type: "State", greeting: "Namaskara", capital: "Bengaluru", bestMonths: "Oct - Mar", famousFood: "Bisi Bele Bath & Mysore Pak", code: "KA" },
  { name: "Kerala", wiki_title: "Kerala", type: "State", greeting: "Namaskaram", capital: "Thiruvananthapuram", bestMonths: "Sep - Mar", famousFood: "Appam & Stew, Karimeen", code: "KL" },
  { name: "Madhya Pradesh", wiki_title: "Madhya_Pradesh", type: "State", greeting: "Namaste", capital: "Bhopal", bestMonths: "Oct - Mar", famousFood: "Poha Jalebi & Dal Bafla", code: "MP" },
  { name: "Maharashtra", wiki_title: "Maharashtra", type: "State", greeting: "Namaskar", capital: "Mumbai", bestMonths: "Oct - Mar", famousFood: "Vada Pav & Puran Poli", code: "MH" },
  { name: "Manipur", wiki_title: "Manipur", type: "State", greeting: "Khurumjari", capital: "Imphal", bestMonths: "Oct - Mar", famousFood: "Eromba & Kangshoi", code: "MN" },
  { name: "Meghalaya", wiki_title: "Meghalaya", type: "State", greeting: "Khublei", capital: "Shillong", bestMonths: "Oct - Apr", famousFood: "Jadoh & Dohneiiong", code: "ML" },
  { name: "Mizoram", wiki_title: "Mizoram", type: "State", greeting: "Chibai", capital: "Aizawl", bestMonths: "Nov - Mar", famousFood: "Bai & Vawksa Rep", code: "MZ" },
  { name: "Nagaland", wiki_title: "Nagaland", type: "State", greeting: "Yekaba", capital: "Kohima", bestMonths: "Oct - May", famousFood: "Smoked Pork & Axone", code: "NL" },
  { name: "Odisha", wiki_title: "Odisha", type: "State", greeting: "Namaskar", capital: "Bhubaneswar", bestMonths: "Oct - Mar", famousFood: "Pakhala Bhata & Rasagola", code: "OD" },
  { name: "Punjab", wiki_title: "Punjab,_India", type: "State", greeting: "Sat Sri Akal", capital: "Chandigarh", bestMonths: "Oct - Mar", famousFood: "Makki di Roti & Sarson da Saag", code: "PB" },
  { name: "Rajasthan", wiki_title: "Rajasthan", type: "State", greeting: "Khamma Ghani", capital: "Jaipur", bestMonths: "Oct - Mar", famousFood: "Dal Baati Churma & Ghevar", code: "RJ" },
  { name: "Sikkim", wiki_title: "Sikkim", type: "State", greeting: "Tashi Delek", capital: "Gangtok", bestMonths: "Mar - May, Oct - Dec", famousFood: "Momo & Phagshapa", code: "SK" },
  { name: "Tamil Nadu", wiki_title: "Tamil_Nadu", type: "State", greeting: "Vanakkam", capital: "Chennai", bestMonths: "Nov - Mar", famousFood: "Idli Dosa & Chettinad Chicken", code: "TN" },
  { name: "Telangana", wiki_title: "Telangana", type: "State", greeting: "Namaste", capital: "Hyderabad", bestMonths: "Oct - Mar", famousFood: "Hyderabadi Dum Biryani", code: "TG" },
  { name: "Tripura", wiki_title: "Tripura", type: "State", greeting: "Khumpui", capital: "Agartala", bestMonths: "Oct - Mar", famousFood: "Mui Borok & Chakhwi", code: "TR" },
  { name: "Uttar Pradesh", wiki_title: "Uttar_Pradesh", type: "State", greeting: "Namaste", capital: "Lucknow", bestMonths: "Oct - Mar", famousFood: "Tunday Kabab & Bedmi Poori", code: "UP" },
  { name: "Uttarakhand", wiki_title: "Uttarakhand", type: "State", greeting: "Namaskar", capital: "Dehradun", bestMonths: "Mar - Jun, Sep - Nov", famousFood: "Aloo ke Gutke & Bal Mithai", code: "UK" },
  { name: "West Bengal", wiki_title: "West_Bengal", type: "State", greeting: "Nomoshkar", capital: "Kolkata", bestMonths: "Oct - Mar", famousFood: "Kosha Mangsho & Rosogolla", code: "WB" },

  // --- 8 UNION TERRITORIES ---
  { name: "Andaman and Nicobar Islands", wiki_title: "Andaman_and_Nicobar_Islands", type: "Union Territory", greeting: "Welcome to Paradise", capital: "Port Blair", bestMonths: "Oct - May", famousFood: "Grilled Lobster & Seafood", code: "AN" },
  { name: "Chandigarh", wiki_title: "Chandigarh", type: "Union Territory", greeting: "Sat Sri Akal", capital: "Chandigarh", bestMonths: "Oct - Mar", famousFood: "Chole Bhature & Butter Chicken", code: "CH" },
  { name: "Dadra and Nagar Haveli and Daman and Diu", wiki_title: "Dadra_and_Nagar_Haveli_and_Daman_and_Diu", type: "Union Territory", greeting: "Welcome", capital: "Daman", bestMonths: "Oct - May", famousFood: "Ubadiyu & Fresh Seafood", code: "DN" },
  { name: "Delhi", wiki_title: "Delhi", type: "Union Territory", greeting: "Namaste Dilli", capital: "New Delhi", bestMonths: "Oct - Mar", famousFood: "Paranthas & Butter Chicken", code: "DL" },
  { name: "Jammu and Kashmir", wiki_title: "Jammu_and_Kashmir_(union_territory)", type: "Union Territory", greeting: "Adaab", capital: "Srinagar (Summer) / Jammu (Winter)", bestMonths: "Apr - Oct", famousFood: "Wazwan & Kahwa Tea", code: "JK" },
  { name: "Ladakh", wiki_title: "Ladakh", type: "Union Territory", greeting: "Julley", capital: "Leh", bestMonths: "May - Sep", famousFood: "Thukpa & Butter Tea", code: "LA" },
  { name: "Lakshadweep", wiki_title: "Lakshadweep", type: "Union Territory", greeting: "Swagatham", capital: "Kavaratti", bestMonths: "Oct - May", famousFood: "Tuna Curry & Coconut Halwa", code: "LD" },
  { name: "Puducherry", wiki_title: "Puducherry", type: "Union Territory", greeting: "Bonjour & Vanakkam", capital: "Pondicherry", bestMonths: "Oct - Mar", famousFood: "French Croissants & Crepes", code: "PY" },
];

export interface WikiPhotoSummaryResult {
  photo_url: string;
  high_res_photo_url?: string;
  thumbnail_url: string;
  short_description: string;
  image_credit?: string;
}

const WIKI_CACHE: Record<string, WikiPhotoSummaryResult> = {};

/**
 * Pre-fetch all Wikipedia photos for 28 States & 8 UTs from server API
 */
export async function prefetchBatchWikiPhotos(): Promise<Record<string, WikiPhotoSummaryResult>> {
  try {
    const res = await fetch('/api/wiki-photos');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.dataset)) {
        data.dataset.forEach((item: any) => {
          if (item.wiki_title) {
            WIKI_CACHE[item.wiki_title] = {
              photo_url: item.photo_url || item.high_res_photo_url || '',
              high_res_photo_url: item.high_res_photo_url || item.photo_url || '',
              thumbnail_url: item.thumbnail_url || '',
              short_description: item.short_description || '',
              image_credit: item.image_credit || `Wikimedia Commons / Wikipedia (${item.name})`,
            };
          }
        });
      }
    }
  } catch (e) {
    console.warn('Batch prefetch of Wiki photos failed, falling back to individual endpoints:', e);
  }
  return WIKI_CACHE;
}

/**
 * Fetch high-res Wikipedia photo and summary for a state or UT title
 */
export async function fetchWikipediaEntitySummary(wikiTitle: string): Promise<WikiPhotoSummaryResult> {
  if (WIKI_CACHE[wikiTitle]) {
    return WIKI_CACHE[wikiTitle];
  }

  try {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiTitle)}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'TourismAppPhotoFetcher/1.0 (contact@yourtourismdomain.com)',
      },
    });

    if (res.ok) {
      const data = await res.json();
      const original_photo = data.originalimage?.source || '';
      const thumbnail_photo = data.thumbnail?.source || '';
      const description = data.description || data.extract || '';

      let high_res = original_photo || thumbnail_photo;
      if (!original_photo && thumbnail_photo && thumbnail_photo.includes('/thumb/')) {
        high_res = thumbnail_photo.rsplit ? thumbnail_photo.rsplit('/', 1)[0].replace('/thumb/', '/') : thumbnail_photo;
      }

      const photoResult: WikiPhotoSummaryResult = {
        photo_url: high_res,
        high_res_photo_url: high_res,
        thumbnail_url: thumbnail_photo,
        short_description: description,
        image_credit: `Wikimedia Commons / Wikipedia (${data.title || wikiTitle})`,
      };

      if (photoResult.photo_url) {
        WIKI_CACHE[wikiTitle] = photoResult;
      }
      return photoResult;
    }
  } catch (err) {
    console.warn(`Wikipedia fetch failed for ${wikiTitle}:`, err);
  }

  return { photo_url: '', high_res_photo_url: '', thumbnail_url: '', short_description: '', image_credit: 'Wikimedia Commons' };
}
