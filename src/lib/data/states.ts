import { StateData } from "@/lib/types";

/**
 * Location directory — curated snapshot of official administrative data.
 *
 * Names follow current government administrative divisions (state/UT level,
 * district level). Sub-district (mandal/tehsil/taluk) detail is provided for
 * the districts that host seeded temple content; the remaining hierarchy is
 * designed to be completed by the admin data-import pipeline (see
 * /docs/data-import.md) which syncs from official census/government data and
 * maintains official codes.
 */

// prettier-ignore
const D: Record<string, string[]> = {
  AP: ["Srikakulam","Parvathipuram Manyam","Vizianagaram","Alluri Sitharama Raju","Visakhapatnam","Anakapalli","Kakinada","East Godavari","Dr. B.R. Ambedkar Konaseema","West Godavari","Eluru","Krishna","NTR","Guntur","Palnadu","Bapatla","Prakasam","SPS Nellore","Tirupati","Chittoor","Annamayya","YSR Kadapa","Kurnool","Nandyal","Anantapur","Sri Sathya Sai"],
  TS: ["Kumuram Bheem Asifabad","Mancherial","Adilabad","Nirmal","Nizamabad","Kamareddy","Rajanna Sircilla","Jagtial","Peddapalli","Karimnagar","Jayashankar Bhupalpally","Bhadradri Kothagudem","Mulugu","Warangal","Hanumakonda","Jangaon","Siddipet","Medak","Medchal-Malkajgiri","Hyderabad","Rangareddy","Vikarabad","Sangareddy","Mahabubnagar","Narayanpet","Wanaparthy","Gadwal Jogulamba","Nagarkurnool","Suryapet","Khammam","Nalgonda","Yadadri Bhuvanagiri","Mahaboobabad"],
  TN: ["Chennai","Chengalpattu","Kanchipuram","Tiruvallur","Ranipet","Vellore","Tirupathur","Thiruvannamalai","Villupuram","Kallakurichi","Salem","Dharmapuri","Krishnagiri","Namakkal","Erode","Tiruppur","The Nilgiris","Coimbatore","Dindigul","Karur","Tiruchirappalli","Perambalur","Ariyalur","Thanjavur","Nagapattinam","Mayiladuthurai","Thiruvarur","Pudukkottai","Sivaganga","Ramanathapuram","Virudhunagar","Madurai","Tenkasi","Tirunelveli","Thoothukudi","Kanniyakumari"],
  KA: ["Belagavi","Ballari","Vijayanagara","Vijayapura","Bagalkot","Bidar","Kalaburagi","Yadgiri","Raichur","Koppala","Gadag","Dharwad","Uttara Kannada","Haveri","Davanagere","Shivamogga","Chitradurga","Tumakuru","Chikkamagaluru","Kodagu","Hassan","Dakshina Kannada","Udupi","Ramanagara","Bengaluru Urban","Bengaluru Rural","Chikballapura","Kolar","Mandya","Chamarajanagara","Mysuru","Kolar Gold Fields"],
  KL: ["Kasaragod","Kannur","Wayanad","Kozhikode","Malappuram","Palakkad","Thrissur","Ernakulam","Idukki","Kottayam","Alappuzha","Pathanamthitta","Kollam","Thiruvananthapuram"],
  MH: ["Mumbai City","Mumbai Suburban","Thane","Palghar","Raigad","Ratnagiri","Sindhudurg","Nashik","Dhule","Nandurbar","Jalgaon","Ahmednagar","Pune","Satara","Sangli","Kolhapur","Solapur","Aurangabad","Chhatrapati Sambhajinagar","Jalna","Parbhani","Hingoli","Nanded","Latur","Osmanabad","Beed","Buldhana","Akola","Amravati","Washim","Yavatmal","Nagpur","Wardha","Chandrapur","Gadchiroli","Gondia","Bhandara"],
  GJ: ["Kachchh","Banaskantha","Patan","Sabarkantha","Mahesana","Gandhinagar","Aravalli","Ahmedabad","Surendranagar","Botad","Kheda","Mahisagar","Panch Mahals","Dahod","Chhota Udepur","Vadodara","Narmada","Bharuch","Surat","Tapi","Dang","Navsari","Valsad","Amreli","Bhavnagar","Gir Somnath","Junagadh","Morbi","Rajkot","Porbandar","Jamnagar","Devbhoomi Dwarka"],
  RJ: ["Ganganagar","Hanumangarh","Bikaner","Churu","Jhunjhunu","Sikar","Jaipur","Alwar","Bharatpur","Dholpur","Karauli","Sawai Madhopur","Dausa","Ajmer","Tonk","Nagaur","Pali","Jodhpur","Barmer","Jaisalmer","Banswara","Dungarpur","Udaipur","Rajsamand","Chittorgarh","Bhilwara","Bundi","Kota","Baran","Jhalawar","Pratapgarh","Sirohi","Jalore"],
  UP: ["Saharanpur","Muzaffarnagar","Shamli","Bijnor","Moradabad","Sambhal","Rampur","Amroha","Jyotiba Phule Nagar","Hapur","Ghaziabad","Gautam Buddha Nagar","Baghpat","Meerut","Bareilly","Pilibhit","Budaun","Shahjahanpur","Lakhimpur Kheri","Hardoi","Sitapur","Bahraich","Shravasti","Balrampur","Gonda","Siddharth Nagar","Basti","Sant Kabir Nagar","Maharajganj","Gorakhpur","Kushinagar","Deoria","Azamgarh","Mau","Ballia","Ghazipur","Chandauli","Varanasi","Sant Ravidas Nagar","Jaunpur","Sonbhadra","Mirzapur","Prayagraj","Fatehpur","Pratapgarh","Kaushambi","Amethi","Sultanpur","Ayodhya","Bara Banki","Lucknow","Unnao","Rae Bareli","Kanpur Nagar","Kanpur Dehat","Etawah","Auraiya","Jalaun","Hamirpur","Mahoba","Banda","Chitrakoot","Firozabad","Mainpuri","Etah","Kannauj","Farrukhabad","Kasganj","Aligarh","Hathras","Mahamaya Nagar","Agra","Mathura"],
  UK: ["Uttarkashi","Chamoli","Rudraprayag","Tehri Garhwal","Dehradun","Pauri Garhwal","Pithoragarh","Bageshwar","Almora","Champawat","Nainital","Udham Singh Nagar","Haridwar"],
  MP: ["Sheopur","Morena","Bhind","Gwalior","Datia","Shivpuri","Guna","Ashoknagar","Sagar","Tikamgarh","Chhatarpur","Panna","Damoh","Niwar","Satna","Rewa","Singrauli","Sidhi","Shahdol","Umaria","Dindori","Jabalpur","Katni","Narsinghpur","Mandla","Seoni","Balaghat","Chhindwara","Betul","Harda","Hoshangabad","Narmadapuram","Raisen","Vidisha","Bhopal","Sehore","Rajgarh","Agar Malwa","Shajapur","Dewas","Mandsaur","Neemuch","Ratlam","Ujjain","Jhabua","Alirajpur","Dhar","Indore","Burhanpur","Khandwa","Khargone","Barwani"],
  OD: ["Bargarh","Jharsuguda","Sambalpur","Deogarh","Sundargarh","Kendujhar","Mayurbhanj","Balasore","Bhadrak","Jajpur","Boudh","Subarnapur","Angul","Dhenkanal","Cuttack","Khordha","Jagatsinghpur","Kendrapara","Puri","Ganjam","Gajapati","Rayagada","Nabarangpur","Kalahandi","Nuapada","Koraput","Malkangiri","Nayagarh","Kandhamal"],
  BR: ["Pashchim Champaran","Purba Champaran","Sheohar","Sitamarhi","Madhubani","Supaul","Araria","Kishanganj","Purnia","Katihar","Madhepura","Saharsa","Darbhanga","Muzaffarpur","Gopalganj","Siwan","Saran","Vaishali","Samastipur","Begusarai","Khagaria","Bhagalpur","Banka","Munger","Lakhisarai","Jamui","Sheikhpura","Nalanda","Patna","Bhojpur","Buxar","Kaimur","Rohtas","Aurangabad","Gaya","Nawada","Jehanabad","Arwal"],
  JH: ["Palamu","Garhwa","Latehar","Chatra","Hazaribagh","Koderma","Giridih","Ramgarh","Bokaro","Dhanbad","Dumka","Jamtara","Deoghar","Godda","Sahebganj","Pakur","East Singhbhum","Seraikela Kharsawan","West Singhbhum","Simdega","Gumla","Lohardaga","Ranchi","Khunti"],
  WB: ["Darjeeling","Kalimpong","Jalpaiguri","Alipurduar","Cooch Behar","Uttar Dinajpur","Dakshin Dinajpur","Malda","Murshidabad","Baharampur","Birbhum","Murshidabad","Nadia","North 24 Parganas","South 24 Parganas","Howrah","Hooghly","Purba Bardhaman","Paschim Bardhaman","Bankura","Purulia","Jhargram","Paschim Medinipur","Purba Medinipur","Kolkata","Kalimpong"],
  AS: ["Tinsukia","Dibrugarh","Sivasagar","Jorhat","Lakhimpur","Dhemaji","Sonitpur","Biswanath","Charaideo","Majuli","Nagaon","Golaghat","Karbi Anglong","West Karbi Anglong","Dima Hasao","Hojai","Morigaon","Nalbari","Baksa","Udalguri","Darrang","Kamrup","Kamrup Metropolitan","Barpeta","Bongaigaon","Chirang","Kokrajhar","Dhubri","South Salmara Mankachar","Goalpara","Karimganj","Hailakandi","Cachar"],
  GA: ["North Goa","South Goa"],
  HR: ["Panchkula","Ambala","Yamunanagar","Kurukshetra","Kaithal","Karnal","Panipat","Sonipat","Jind","Fatehabad","Sirsa","Hisar","Bhiwani","Charkhi Dadri","Rohtak","Jhajjar","Mahendragarh","Rewari","Gurugram","Faridabad","Palwal","Nuh","Ambala"],
  PB: ["Pathankot","Gurdaspur","Amritsar","Tarn Taran","Kapurthala","Jalandhar","SBS Nagar","Hoshiarpur","Rupnagar","SAS Nagar","Ludhiana","Fatehgarh Sahib","Moga","Fazilka","Ferozepur","Faridkot","Sri Muktsar Sahib","Bathinda","Mansa","Sangrur","Patiala","Pathankot","Barnala"],
  CG: ["Koriya","Surguja","Balrampur","Surajpur","Jashpur","Raigarh","Korba","Janjgir Champa","Bilaspur","Mungeli","Raipur","Baloda Bazar","Gariaband","Mahasamund","Kondagaon","Narayanpur","Bastar","Dantewada","Bijapur","Sukma","Kanker","Dhamtari","Kabirdham","Bemetara","Rajnandgaon","Mohla Manpur","Khairgarh Chhuikhadan","Gaurella Pendra Marwahi","Sarangarh Bilaigarh","Sakti","Manendragarh","Vishrampur"],
  TR: ["West Tripura","Sepahijala","Khowai","Dhalai","Unakoti","North Tripura","Gomati","South Tripura"],
  MN: ["Tengnoupal","Chandel","Churachandpur","Bishnupur","Thoubal","Imphal East","Imphal West","Kangpokpi","Senapati","Ukhrul","Kamjong","Pherzawl","Noney","Jiribam","Kakching","Tamenglong"],
  ML: ["West Garo Hills","South Garo Hills","East Garo Hills","North Garo Hills","South West Garo Hills","West Khasi Hills","East Khasi Hills","Ri Bhoi","South West Khasi Hills","Jaintia Hills","Eastern West Khasi Hills"],
  AR: ["Tawang","West Kameng","East Kameng","Papum Pare","Kra Daadi","Kurung Kumey","Lower Subansiri","Upper Subansiri","West Siang","East Siang","Siang","Upper Siang","Lower Dibang Valley","Dibang Valley","Lohit","Anjaw","Namsai","Changlang","Tirap","Longding","Kamle","Pakke Kessang","Lepa Rada","Shi Yomi"],
  NL: ["Noklak","Tuensang","Mon","Longleng","Kiphire","Phek","Zunheboto","Wokha","Mokokchung","Peren","Dimapur","Kohima","Chümoukedima","Niuland","Tseminyü","Shamator"],
  MZ: ["Mamit","Kolasib","Aizawl","Champhai","Saitual","Serchhip","Lunglei","Lawngtlai","Siaha","Khawzawl","Hnahthial"],
  SK: ["Mangan","Gangtok","Namchi","Gyalshing","Soreng","Pakyong"],
  JK: ["Kupwara","Baramulla","Bandipora","Ganderbal","Srinagar","Budgam","Pulwama","Shopian","Kulgam","Anantnag","Ramban","Doda","Kishtwar","Udhampur","Reasi","Rajouri","Poonch","Kathua","Samba","Jammu"],
  LA: ["Leh","Kargil"],
  DL: ["New Delhi","Central Delhi","North Delhi","North East Delhi","West Delhi","South Delhi","South West Delhi","East Delhi","Shahdara","North West Delhi","South East Delhi"],
  PY: ["Puducherry","Karaikal","Mahe","Yanam"],
  CH: ["Chandigarh"],
  AN: ["Nicobar","South Andaman","North & Middle Andaman"],
  LD: ["Lakshadweep"],
  DN: ["Dadra and Nagar Haveli","Daman","Diu"],
};

// prettier-ignore
const STATES: StateData[] = [
  { code:"AP", slug:"andhra-pradesh", name:"Andhra Pradesh", type:"state", subUnitTerm:"Mandal", capital:"Amaravati", districts:D.AP },
  { code:"TS", slug:"telangana", name:"Telangana", type:"state", subUnitTerm:"Mandal", capital:"Hyderabad", districts:D.TS },
  { code:"TN", slug:"tamil-nadu", name:"Tamil Nadu", type:"state", subUnitTerm:"Taluk", capital:"Chennai", districts:D.TN },
  { code:"KA", slug:"karnataka", name:"Karnataka", type:"state", subUnitTerm:"Taluk", capital:"Bengaluru", districts:D.KA },
  { code:"KL", slug:"kerala", name:"Kerala", type:"state", subUnitTerm:"Taluk", capital:"Thiruvananthapuram", districts:D.KL },
  { code:"MH", slug:"maharashtra", name:"Maharashtra", type:"state", subUnitTerm:"Taluka", capital:"Mumbai", districts:D.MH },
  { code:"GJ", slug:"gujarat", name:"Gujarat", type:"state", subUnitTerm:"Taluka", capital:"Gandhinagar", districts:D.GJ },
  { code:"RJ", slug:"rajasthan", name:"Rajasthan", type:"state", subUnitTerm:"Tehsil", capital:"Jaipur", districts:D.RJ },
  { code:"UP", slug:"uttar-pradesh", name:"Uttar Pradesh", type:"state", subUnitTerm:"Tehsil", capital:"Lucknow", districts:D.UP },
  { code:"UK", slug:"uttarakhand", name:"Uttarakhand", type:"state", subUnitTerm:"Tehsil", capital:"Dehradun", districts:D.UK },
  { code:"MP", slug:"madhya-pradesh", name:"Madhya Pradesh", type:"state", subUnitTerm:"Tehsil", capital:"Bhopal", districts:D.MP },
  { code:"OD", slug:"odisha", name:"Odisha", type:"state", subUnitTerm:"Tehsil", capital:"Bhubaneswar", districts:D.OD },
  { code:"BR", slug:"bihar", name:"Bihar", type:"state", subUnitTerm:"Sub-district", capital:"Patna", districts:D.BR },
  { code:"JH", slug:"jharkhand", name:"Jharkhand", type:"state", subUnitTerm:"Sub-division", capital:"Ranchi", districts:D.JH },
  { code:"WB", slug:"west-bengal", name:"West Bengal", type:"state", subUnitTerm:"Block", capital:"Kolkata", districts:D.WB },
  { code:"AS", slug:"assam", name:"Assam", type:"state", subUnitTerm:"Sub-division", capital:"Dispur", districts:D.AS },
  { code:"GA", slug:"goa", name:"Goa", type:"state", subUnitTerm:"Taluka", capital:"Panaji", districts:D.GA },
  { code:"HR", slug:"haryana", name:"Haryana", type:"state", subUnitTerm:"Tehsil", capital:"Chandigarh", districts:D.HR },
  { code:"PB", slug:"punjab", name:"Punjab", type:"state", subUnitTerm:"Tehsil", capital:"Chandigarh", districts:D.PB },
  { code:"CG", slug:"chhattisgarh", name:"Chhattisgarh", type:"state", subUnitTerm:"Tehsil", capital:"Raipur", districts:D.CG },
  { code:"TR", slug:"tripura", name:"Tripura", type:"state", subUnitTerm:"Sub-division", capital:"Agartala", districts:D.TR },
  { code:"MN", slug:"manipur", name:"Manipur", type:"state", subUnitTerm:"Sub-division", capital:"Imphal", districts:D.MN },
  { code:"ML", slug:"meghalaya", name:"Meghalaya", type:"state", subUnitTerm:"Block", capital:"Shillong", districts:D.ML },
  { code:"AR", slug:"arunachal-pradesh", name:"Arunachal Pradesh", type:"state", subUnitTerm:"Circle", capital:"Itanagar", districts:D.AR },
  { code:"NL", slug:"nagaland", name:"Nagaland", type:"state", subUnitTerm:"Circle", capital:"Kohima", districts:D.NL },
  { code:"MZ", slug:"mizoram", name:"Mizoram", type:"state", subUnitTerm:"Block", capital:"Aizawl", districts:D.MZ },
  { code:"SK", slug:"sikkim", name:"Sikkim", type:"state", subUnitTerm:"Sub-division", capital:"Gangtok", districts:D.SK },
  { code:"JK", slug:"jammu-and-kashmir", name:"Jammu & Kashmir", type:"union_territory", subUnitTerm:"Tehsil", capital:"Srinagar", districts:D.JK },
  { code:"LA", slug:"ladakh", name:"Ladakh", type:"union_territory", subUnitTerm:"Tehsil", capital:"Leh", districts:D.LA },
  { code:"DL", slug:"delhi", name:"Delhi", type:"union_territory", subUnitTerm:"District", capital:"New Delhi", districts:D.DL },
  { code:"PY", slug:"puducherry", name:"Puducherry", type:"union_territory", subUnitTerm:"Circle", capital:"Puducherry", districts:D.PY },
  { code:"CH", slug:"chandigarh", name:"Chandigarh", type:"union_territory", subUnitTerm:"Tehsil", capital:"Chandigarh", districts:D.CH },
  { code:"AN", slug:"andaman-and-nicobar", name:"Andaman & Nicobar Islands", type:"union_territory", subUnitTerm:"Tehsil", capital:"Port Blair", districts:D.AN },
  { code:"LD", slug:"lakshadweep", name:"Lakshadweep", type:"union_territory", subUnitTerm:"Sub-division", capital:"Kavaratti", districts:D.LD },
  { code:"DN", slug:"dadra-nagar-haveli-daman-diu", name:"Dadra & Nagar Haveli and Daman & Diu", type:"union_territory", subUnitTerm:"Taluka", capital:"Daman", districts:D.DN },
];

export { STATES };