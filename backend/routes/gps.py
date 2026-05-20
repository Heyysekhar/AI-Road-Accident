from fastapi import APIRouter
from pydantic import BaseModel
import math, random

router = APIRouter()

def haversine(lat1, lon1, lat2, lon2):
    R = 6371
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    a = math.sin((phi2-phi1)/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(math.radians(lon2-lon1)/2)**2
    return round(R * 2 * math.atan2(math.sqrt(a), math.sqrt(1-a)), 2)

ZONES = [
    {"id":1, "name":"NH-8 Gurgaon Toll",        "lat":28.4595,"lng":77.0266,"risk":"CRITICAL","radius":2.0},
    {"id":2, "name":"Yamuna Expressway KM-28",   "lat":28.3183,"lng":77.4375,"risk":"HIGH",    "radius":3.0},
    {"id":3, "name":"Delhi-Meerut Expressway",   "lat":28.7041,"lng":77.5245,"risk":"HIGH",    "radius":2.5},
    {"id":4, "name":"Mumbai-Pune Expressway",    "lat":18.6725,"lng":73.5120,"risk":"CRITICAL","radius":4.0},
    {"id":5, "name":"Bangalore Hosur Road",      "lat":12.8445,"lng":77.6610,"risk":"MEDIUM",  "radius":1.5},
    {"id":6, "name":"Chennai OMR IT Corridor",   "lat":12.8996,"lng":80.2209,"risk":"MEDIUM",  "radius":2.0},
    {"id":7, "name":"Hyderabad ORR Patancheru",  "lat":17.4935,"lng":78.3087,"risk":"HIGH",    "radius":3.0},
    {"id":8, "name":"Pune Satara Road",          "lat":18.4200,"lng":73.8567,"risk":"CRITICAL","radius":3.5},
    {"id":9, "name":"Kolkata NH-12 Bypass",      "lat":22.5054,"lng":88.3476,"risk":"HIGH",    "radius":2.5},
    {"id":10,"name":"Ahmedabad-Vadodara Exp",    "lat":22.6708,"lng":72.8521,"risk":"MEDIUM",  "radius":2.0},
]

HOSPITALS = [
    {"name":"AIIMS Delhi",             "lat":28.5672,"lng":77.2100,"phone":"011-26588500","type":"Trauma Centre","beds":800, "rating":4.7,"city":"Delhi"},
    {"name":"Safdarjung Hospital",     "lat":28.5691,"lng":77.2062,"phone":"011-26730000","type":"Government",   "beds":1500,"rating":4.3,"city":"Delhi"},
    {"name":"Max Hospital Gurgaon",    "lat":28.4601,"lng":77.0635,"phone":"0124-4141414","type":"Private",      "beds":400, "rating":4.6,"city":"Delhi"},
    {"name":"Apollo Delhi",            "lat":28.5672,"lng":77.2790,"phone":"011-26925801","type":"Private",      "beds":600, "rating":4.5,"city":"Delhi"},
    {"name":"KEM Hospital Mumbai",     "lat":18.9767,"lng":72.8405,"phone":"022-24107000","type":"Government",   "beds":1800,"rating":4.2,"city":"Mumbai"},
    {"name":"Lilavati Hospital",       "lat":19.0506,"lng":72.8311,"phone":"022-26751000","type":"Private",      "beds":300, "rating":4.6,"city":"Mumbai"},
    {"name":"Manipal Bangalore",       "lat":12.9698,"lng":77.5968,"phone":"080-25024444","type":"Private",      "beds":600, "rating":4.5,"city":"Bangalore"},
    {"name":"Victoria Hospital",       "lat":12.9630,"lng":77.5785,"phone":"080-26700178","type":"Government",   "beds":800, "rating":4.1,"city":"Bangalore"},
    {"name":"Apollo Chennai",          "lat":13.0569,"lng":80.2425,"phone":"044-28290200","type":"Private",      "beds":500, "rating":4.7,"city":"Chennai"},
    {"name":"Govt General Chennai",    "lat":13.0818,"lng":80.2785,"phone":"044-25305000","type":"Government",   "beds":2000,"rating":4.0,"city":"Chennai"},
    {"name":"Care Hospitals Hyderabad","lat":17.4126,"lng":78.4071,"phone":"040-30418000","type":"Private",      "beds":400, "rating":4.4,"city":"Hyderabad"},
    {"name":"NIMS Hyderabad",          "lat":17.4098,"lng":78.3929,"phone":"040-23489000","type":"Government",   "beds":1000,"rating":4.2,"city":"Hyderabad"},
    {"name":"SSKM Kolkata",            "lat":22.5396,"lng":88.3429,"phone":"033-22041735","type":"Government",   "beds":1700,"rating":4.1,"city":"Kolkata"},
    {"name":"Apollo Kolkata",          "lat":22.5439,"lng":88.3898,"phone":"033-23201000","type":"Private",      "beds":400, "rating":4.5,"city":"Kolkata"},
    {"name":"Ruby Hall Pune",          "lat":18.5204,"lng":73.8567,"phone":"020-26163391","type":"Private",      "beds":500, "rating":4.6,"city":"Pune"},
    {"name":"Sassoon General Pune",    "lat":18.5204,"lng":73.8516,"phone":"020-26128000","type":"Government",   "beds":1200,"rating":4.0,"city":"Pune"},
]

class LocationQuery(BaseModel):
    lat: float
    lng: float
    radius_km: float = 50.0

class VehicleUpdate(BaseModel):
    vehicle_id: str
    lat: float
    lng: float
    speed: float = 0

@router.get("/accident-zones")
async def get_zones():
    return {"zones": ZONES, "total": len(ZONES)}

@router.post("/nearby-hospitals")
async def nearby_hospitals(q: LocationQuery):
    results = []
    for h in HOSPITALS:
        dist = haversine(q.lat, q.lng, h["lat"], h["lng"])
        if dist <= q.radius_km:
            results.append({**h, "distance": dist, "eta": round(dist/0.5)})
    results.sort(key=lambda x: x["distance"])
    return {"hospitals": results[:8], "total_found": len(results)}

@router.get("/live-vehicles")
async def live_vehicles():
    bases = [(28.615,77.210,"DL-01-AB-1234"),(18.680,73.850,"MH-02-CD-5678"),
             (12.970,77.590,"KA-03-EF-9012"),(13.080,80.270,"TN-04-GH-3456")]
    return {"vehicles": [{"vehicle_id":vid,
        "lat": lat+random.uniform(-0.03,0.03),
        "lng": lng+random.uniform(-0.03,0.03),
        "speed": round(random.uniform(30,110),1),
        "status": random.choice(["SAFE","SAFE","SAFE","WARNING","DANGER"])
    } for lat,lng,vid in bases]}

@router.post("/update")
async def update_vehicle(data: VehicleUpdate):
    nearby = [z for z in ZONES if haversine(data.lat,data.lng,z["lat"],z["lng"]) < z["radius"]+5]
    in_zone = any(haversine(data.lat,data.lng,z["lat"],z["lng"]) <= z["radius"] for z in nearby)
    return {"vehicle_id":data.vehicle_id, "in_danger_zone":in_zone,
            "nearby_zones":nearby[:3],
            "alert":"DANGER: High-risk zone!" if in_zone else "Route clear"}
