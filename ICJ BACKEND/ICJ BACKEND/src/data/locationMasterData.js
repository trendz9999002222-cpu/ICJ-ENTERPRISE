/**
 * ICJ ENTERPRISE PLATFORM — CASCADING LOCATION MASTER REGISTRY
 * Maps Country -> State -> District -> City -> PIN Code
 */

export const INDIAN_LOCATION_MASTER = {
  "Delhi": {
    districts: ["New Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi", "Central Delhi"],
    cities: ["New Delhi", "Connaught Place", "Dwarka", "Rohini", "Saket", "Vasant Kunj"],
    pins: ["110001", "110002", "110003", "110017", "110075", "110085"],
  },
  "Maharashtra": {
    districts: ["Mumbai City", "Mumbai Suburban", "Pune", "Nagpur", "Thane", "Nashik"],
    cities: ["Mumbai", "Navi Mumbai", "Pune", "Nagpur", "Thane", "Nashik"],
    pins: ["400001", "400002", "411001", "440001", "400601", "422001"],
  },
  "Karnataka": {
    districts: ["Bengaluru Urban", "Bengaluru Rural", "Mysuru", "Mangaluru", "Hubballi-Dharwad"],
    cities: ["Bengaluru", "Mysuru", "Mangaluru", "Hubballi", "Dharwad"],
    pins: ["560001", "560002", "570001", "575001", "580001"],
  },
  "Uttar Pradesh": {
    districts: ["Lucknow", "Gautam Buddha Nagar", "Ghaziabad", "Kanpur Nagar", "Varanasi", "Prayagraj"],
    cities: ["Lucknow", "Noida", "Greater Noida", "Ghaziabad", "Kanpur", "Varanasi", "Prayagraj"],
    pins: ["226001", "201301", "201308", "201001", "208001", "221001", "211001"],
  },
  "Tamil Nadu": {
    districts: ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem"],
    cities: ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem"],
    pins: ["600001", "600002", "641001", "625001", "620001"],
  },
  "West Bengal": {
    districts: ["Kolkata", "North 24 Parganas", "South 24 Parganas", "Howrah", "Darjeeling"],
    cities: ["Kolkata", "Salt Lake", "New Town", "Howrah", "Siliguri"],
    pins: ["700001", "700091", "700156", "711101", "734001"],
  },
  "Gujarat": {
    districts: ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Gandhinagar"],
    cities: ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Gandhinagar"],
    pins: ["380001", "395001", "390001", "360001", "382010"],
  },
  "Rajasthan": {
    districts: ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer"],
    cities: ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer"],
    pins: ["302001", "342001", "313001", "324001", "305001"],
  },
  "Telangana": {
    districts: ["Hyderabad", "Medchal-Malkajgiri", "Rangareddy", "Warangal"],
    cities: ["Hyderabad", "Secunderabad", "Cyberabad", "Warangal"],
    pins: ["500001", "500003", "500081", "506001"],
  },
  "Punjab": {
    districts: ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "SAS Nagar"],
    cities: ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Mohali"],
    pins: ["141001", "143001", "144001", "147001", "160055"],
  },
};

export const STATES_LIST = Object.keys(INDIAN_LOCATION_MASTER);
export default INDIAN_LOCATION_MASTER;
