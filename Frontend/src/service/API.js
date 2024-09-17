import moment from "moment";
import { useNavigate } from "react-router-dom";
function getTimeIntervalSinceToday(months){
    const today = moment().format('YYYY-MM-DD');
    const startDate = moment().subtract(months,'months').format('YYYY-MM-DD');
    return [startDate,today];
}

function toTimestamp(a){
    return moment(a.dateOfSleep).unix() * 1000;
}

//https://developer.withings.com/api-reference#tag/measure/operation/measure-getmeas
const withingsKeys = {
    'weight': 1,//kg
    'height': 4,//meter
    'fat_free_mass': 5,//kg
    'fat_ratio': 6,//%
    'fat_mass_weight': 8,//kg
    'spo2': 54,//%
    'muscle_mass': 76,//kg
    'bone_mass': 88,//kg

}

export default class API {

    constructor(fitbitCookieName,withingsCookieName){
        //token is a jwt token used for password authentication 
        //in this example that is given when the user logs in
        
        this.fitbitCookieName = fitbitCookieName;
        this.withingsCookieName = withingsCookieName;
        this.readTokens();
        this.navigate = useNavigate();
        //endpoint url is the backend location e.g. http://localhost:<port you ran flask api on?
        // this.fitbitAPI = axios.create({
        //     baseURL: 'https://api.fitbit.com/1/user/',
        //     headers: makeHeader(fitbit),
        // });

        // //clear authentication
        // this.resetToken = ()=> {
        //     localStorage.setItem('token',false)
        //     setAuthToken(false);
        // }
    }

    readTokens(){
        this.fitbitToken = localStorage.getItem(this.fitbitCookieName);
        this.withingsToken = localStorage.getItem(this.withingsCookieName);
    }

    makeHeader(token) {
        const headers = token? {
            Authorization: token ? `Bearer ${token}` : undefined,
            'Content-Type': 'application/json',
          } : {};
        return headers;
    }

    async makeQuery(url,method,token,parameters,errorCallback,successCallback){
        //todo: figure out how to handle expired token codes
        const pText = new URLSearchParams();
        if(parameters){
            for(const [key,value] of Object.entries(parameters)){
                pText.append(key,value);
            }
            url = url+'?'+pText.toString();
        }
        var stuff = {
            method: method,
            headers: this.makeHeader(token),
        }
        return fetch(url, stuff)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Error fetching: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            if(successCallback){
                successCallback(data);
            }
            return data;
        })
        .catch((error) => {
            if (errorCallback){
                errorCallback(error);
            } else{
                console.error("Error fetching",url, error);
            }
            return null;
        });
    }

    async makeWithingsRequest(parameters,successCallback,errorCallback){
        //todo: handle expired codes
        const token = this.withingsToken;
        const url = 'https://wbsapi.withings.net/measure';
        const pText = new URLSearchParams();
        for(const [key,value] of Object.entries(parameters)){
            pText.append(key,value);
        }
        var stuff = {
            method: 'POST',
            headers: this.makeHeader(token),
            body: pText,
        }
        return fetch(url, stuff)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Error fetching withings: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                if(successCallback){
                    successCallback(data);
                }
                if(data.status === 401){
                    this.resetWithingsToken();
                }
                return data.body.measuregrps;
            })
            .catch((error) => {
                if (errorCallback){
                    errorCallback(error);
                } else{
                    console.error("Error fetching withings",url, error);
                }
                return null;
            });
    }

    //todo: figure out refresh tokens
    resetWithingsToken(){
        localStorage.removeItem(this.withingsCookieName);
        this.navigate('/')
    }

    resetFitbitToken(){
        localStorage.removeItem(this.fitbitCookieName);
        this.navigate('/')
    }

    async fetchWithingsEntry(item,startDate,endDate){
        const entry  = {
            "action": "getmeas",
            "category": "1",  //  1 for real measures, 2 for user objectives.
        }
        
        const key = withingsKeys[item.toLowerCase()];
        if(key === undefined){
            console.log('invalid key',item);
            return null
        }
        entry['meastype'] = key
        if(startDate && endDate){
            entry['startdate'] = startDate;
            entry['endDate'] = endDate;
        }
        return this.makeWithingsRequest(entry);
    }

    async fetchFitbitProfile(){
        const accessToken = this.fitbitToken;
        return this.makeQuery("https://api.fitbit.com/1/user/-/profile.json",'GET',accessToken)
    }

    async fetchFitbitSleepLog(startDate){
        const accessToken = this.fitbitToken;
        const args = {
            'afterDate': startDate,
            'sort': 'desc',
            'limit': 100,
            'offset':0,
        }
        return this.makeQuery("https://api.fitbit.com/1.2/user/-/sleep/list.json",'GET',accessToken,args);
    }

    async fetchFitbitHeartRate(start,end){
        const accessToken = this.fitbitToken;
        return this.makeQuery(`https://api.fitbit.com/1/user/-/activities/heart/date/${start}/${end}.json`,'GET',accessToken);
    }

    async fetchFitbitSpO2(start,end){
        const accessToken = this.fitbitToken;
        return this.makeQuery(`https://api.fitbit.com/1/user/-/spo2/date/${start}/${end}.json`,'GET',accessToken);
    }

    async fetchFitbitSleepLogRange(start,end){
        const accessToken = this.fitbitToken;
        return this.makeQuery(`https://api.fitbit.com/1.2/user/-/sleep/date/${start}/${end}.json`,'GET',accessToken);
    }

    async fetchFitbitStepsRange(start,end){
        const accessToken = this.fitbitToken;
        return this.makeQuery(`https://api.fitbit.com/1/user/-/activities/steps/date/${start}/${end}.json`,'GET',accessToken);
    }

    async fetchFitbitSleepLogByDate(date){
        const accessToken = this.fitbitToken;
        return this.makeQuery(`https://api.fitbit.com/1.2/user/-/sleep/date/${date}.json`,'GET',accessToken);

    }

    async getStepsSince(months){
        const [start,stop] = getTimeIntervalSinceToday(3);
        const tempData = await this.fetchFitbitStepsRange(start,stop);
        if(tempData !== null){
            return tempData['activities-steps'];
        }
        return null
    }
    

    async getSleepSince(months){
        const [start,stop] = getTimeIntervalSinceToday(3);
        const tempSleepData = await this.fetchFitbitSleepLogRange(start,stop);
        if(tempSleepData !== null){
            const temp = tempSleepData.sleep.map((log) => ({
                ...log,
                timestamp: toTimestamp(log.dateOfSleep),
                }))
                .sort((a, b) => a.timestamp - b.timestamp);
            return temp
        }
        return null
    }


    

    getParamList(pObj){
        //returns an object and turns the entries into a url query
        //e.g {key: value} => http://localhost:<port>/location?key=value
        let newParams = {}
        let empty= true;
        for(let k of Object.keys(pObj)){
            if(pObj[k] !== undefined & pObj[k] !== null){
                newParams[k] = pObj[k];
                empty = false;
            }
        }
        let paramQuery = '';
        if(!empty){
            let pstring = new URLSearchParams(newParams);
            paramQuery = paramQuery + '?' + pstring
        }
        return paramQuery
    }
}