from flask import Flask, request
import requests
import json

app = Flask(__name__)
@app.route("/")
@app.route("/business.html")
def index():
    return app.send_static_file('business.html')


yelpURL = "https://api.yelp.com/v3/businesses/search"
yelpAPIkey = "b_yLhLOcddnnvb1EpmJddnIlt3IKMkzdYeROyLzF3lxtTpRLDLwJsmqJPoe42OQF8Vnsbr7b4DW4Pmfwm-9v0nxLlvcUBF3EuxCs6up4zm7C2GIBcDKxIsxUHr89Y3Yx"
yelp_header = {"Authorization": "Bearer " + yelpAPIkey}

geocodeURL = "https://maps.googleapis.com/maps/api/geocode/json"
googleAPIkey = "AIzaSyBQdU3CrAwtbz-k7wbPCMlpasxxovsbBpE"

iPInfoURL = "https://ipinfo.io/"
ipInfoToken = "2e4b1285f5a1cd"

@app.route("/search")
def search():
    keyword = request.args.get('keyword')

    dist = request.args.get('dist')
    try:
        radius = int(dist)
    except:
        radius = 10
    radius = radius * 1609

    category = request.args.get('category')

    auto_detect = request.args.get('auto_detect')
    if auto_detect == "true":
        autoDetect_request = requests.get(iPInfoURL, params = {"token": ipInfoToken})
        autoDetectOutput = autoDetect_request.json()
        coords = autoDetectOutput["loc"].split(",")   
        lat = coords[0]
        long = coords[1]
    else:
        loc = request.args.get('loc')
        geocode_request = requests.get(geocodeURL, params = {"address": loc, "key": googleAPIkey})
        geocodeOutput = geocode_request.json()
        if len(geocodeOutput["results"]) > 0:
            lat = str(geocodeOutput["results"][0]["geometry"]["location"]["lat"])
            long = str(geocodeOutput["results"][0]["geometry"]["location"]["lng"])
        else:
            return "No Results Found"
    
    yelp_params = {
        "term": keyword,
        "latitude": lat,
        "longitude": long,
        "categories": category,
        "radius": radius
    }
    yelp_request = requests.get(yelpURL, headers = yelp_header, params = yelp_params)
    yelpOutput = yelp_request.json()

    results = []
    for i in range(len(yelpOutput["businesses"])):
        business = yelpOutput["businesses"][i]
        info = {
            "id": business["id"],
            "name": business["name"],
            "image": business["image_url"],
            "rating": business["rating"],
            "distance": round(business["distance"] / 1609, 2)
        }
        results.append(info)

    if len(results) == 0:
        return "No Results Found"
    return json.dumps({"businesses": results})


yelpDetailURL = "https://api.yelp.com/v3/businesses/"

@app.route("/detail")
def detail():
    id = request.args.get('id')
    detail_request = requests.get(yelpDetailURL + id, headers = yelp_header)
    detailOutput = detail_request.json()

    info = {"name": detailOutput["name"]}

    try:
        info["status"] = detailOutput["hours"][0]["is_open_now"]
    except:
        info["status"] = None

    try:
        info["address"] = " ".join(detailOutput["location"]["display_address"])
    except:
        info["address"] = None

    try:
        info["transactions"] = detailOutput["transactions"]
    except:
        info["transactions"] = None

    try:
        info["categories"] = detailOutput["categories"]
    except:
        info["categories"] = None
    
    try:
        info["phone"] = detailOutput["display_phone"]
    except:
        info["phone"] = None
    
    try:
        info["price"] = detailOutput["price"]
    except:
        info["price"] = None
    
    try:
        info["url"] = detailOutput["url"],
    except:
        info["url"] = None

    try:
        info["photos"] = detailOutput["photos"]
    except:
        info["photos"] = None

    return json.dumps(info)


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8080, debug=True)