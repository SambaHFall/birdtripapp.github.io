import requests
from bs4 import BeautifulSoup
import pandas as pd
import tqdm

# vernacular-name
# scientific-name
# size
# wingspan
# order
# family
# map
# image
# audio

def load_bird_info(birdname, default_value=None, display=False) :

	res = {
		"vernacular" : default_value, 
		"scientific" : default_value, 
		"size" : default_value,
		"wingspan" : default_value,
		"order" : default_value,
		"family": default_value,
		"map_url" : default_value,
		"image_url" : default_value,
		"audio_url" : default_value
		}

	url = "https://www.oiseaux.net/oiseaux/" + ".".join(birdname.lower().split(" ")) + ".html"
	if display :
		print(url)
	ua = {'User-agent': 'Mozilla/5.0'}
	page = requests.get(url, headers=ua)
	soup = BeautifulSoup(page.content, "html.parser")

	try :
		res["vernacular"] = soup.find("h1", attrs={"class":"titre"}).find("span").text
	except:
		print("Vernacular name could not be loaded")

	try :
		res["scientific"] = soup.find("h2", attrs={"class":"sous_titre"}).find("span", class_="binominal").text
	except:
		print("Scientific name could not be loaded")

	try :
		size_info = soup.select("div.biometrie > div.on_bio_titre")[2].select("ul li")
		for li in size_info :
			text = li.text.strip()
			if text.startswith("Taille") :
				res["size"] = text.split(":")[1].strip()
			elif text.startswith("Envergure") :
				res["wingspan"] = text.split(":")[1].strip()
	except:
		print("Size/Wingspan could not be loaded")

	try :
		taxo_info = soup.select("div.biometrie > div.on_bio_titre")[0].select("ul li")
		for li in taxo_info :
			text = li.text.strip()
			if text.startswith("Ordre") :
				res["order"] = text.split(":")[1].strip()
			elif text.startswith("Famille") :
				res["family"] = text.split(":")[1].strip()
	except:
		print("Order/Family could not be loaded")

	try: 
		res["map_url"] = soup.select("div.biometrie > div.on_bio_titre")[4].select("img.on_mapbio")[0]["src"]
	except:
		print("Map could not be loaded")

	try: 
		res["image_url"] = []

		iconography = soup.select("#iconographie2")[0].select("figure a img")
		if iconography :
			for icon in iconography :
				im = icon["src"]
				res["image_url"].append(im)
	except:
		print("Image could not be loaded")

	try: 
		res["audio_url"]  = soup.find("meta", attrs={"property" : "og:audio"})["content"]
	except:
		print("Audio could not be loaded")

	if len(res["image_url"]) == 0:
		res["image_url"] = None

	return pd.DataFrame({k: [v] for k,v in res.items()})

def fetch_bird_names() :

	print("Loading bird names")

	birdlist = []

	url = "https://www.oiseaux.net/oiseaux/"
	ua = {'User-agent': 'Mozilla/5.0'}
	page = requests.get(url, headers=ua)
	soup = BeautifulSoup(page.content, "html.parser")

	nexts = soup.select("div.on-pays div.on-liste div a")[:10]

	for nxt in nexts :
		next_url = nxt["href"]
		next_page = requests.get(next_url, headers=ua)
		next_soup = BeautifulSoup(next_page.content, "html.parser")
		names = next_soup.select("table.tb_lite tr")
		names = [x.select("td a")[0].text.split("\n")[0] for x in names if x.select("td a") ]
		birdlist += names

	birdlist = list(set(birdlist))

	with open("../data/birdnames.txt", 'w', encoding='utf-8') as f :
		f.write("\n".join(birdlist))

	print("Bird names loaded")

def create_birds_table(tryagain=True) :
	try:
		with open("../data/birdnames.txt", 'r', encoding='utf-8') as f :
			birdlist = f.read().split("\n")
		
		df = pd.DataFrame()
		for bird in tqdm.tqdm(birdlist) :
			df = pd.concat([df, load_bird_info(bird)])

		df.to_csv("../data/birdtable.csv", index=False)
		clean_df = df[~df["image_url"].isna()]
		clean_df.to_csv("../data/cleanbirdtable.csv", index=False)

	except :
		if tryagain :
			fetch_bird_names()
			create_birds_table(tryagain=False)
		else :
			print("Could not load bird info")
			raise



create_birds_table()